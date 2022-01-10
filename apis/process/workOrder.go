package process

import (
	"encoding/json"
	"errors"
	"ferry/global/orm"
	"ferry/models/process"
	"ferry/models/system"
	"ferry/pkg/notify"
	"ferry/pkg/service"
	"ferry/tools"
	"ferry/tools/app"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

/*
 @Author : lanyulei
*/

// 流程結構包括節點，流轉和模版
func ProcessStructure(c *gin.Context) {
	processId := c.DefaultQuery("processId", "")
	if processId == "" {
		app.Error(c, -1, errors.New("參數不正確，請確定參數processId是否傳遞"), "")
		return
	}
	workOrderId := c.DefaultQuery("workOrderId", "0")
	if workOrderId == "" {
		app.Error(c, -1, errors.New("參數不正確，請確定參數workOrderId是否傳遞"), "")
		return
	}
	workOrderIdInt, _ := strconv.Atoi(workOrderId)
	processIdInt, _ := strconv.Atoi(processId)
	result, err := service.ProcessStructure(c, processIdInt, workOrderIdInt)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	if workOrderIdInt != 0 {
		currentState := result["workOrder"].(service.WorkOrderData).CurrentState
		userAuthority, err := service.JudgeUserAuthority(c, workOrderIdInt, currentState)
		if err != nil {
			app.Error(c, -1, err, fmt.Sprintf("判斷用戶是否有權限失敗，%v", err.Error()))
			return
		}
		result["userAuthority"] = userAuthority
	}

	app.OK(c, result, "數據獲取成功")
}

// 新建工單
func CreateWorkOrder(c *gin.Context) {

	err := service.CreateWorkOrder(c)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, "", "成功提交工單申請")
}

// 工單列表
func WorkOrderList(c *gin.Context) {
	/*
		1. 待辦工單
		2. 我創建的
		3. 我相關的
		4. 所有工單
	*/

	var (
		result      interface{}
		err         error
		classifyInt int
	)

	classify := c.DefaultQuery("classify", "")
	if classify == "" {
		app.Error(c, -1, errors.New("參數錯誤，請確認classify是否傳遞"), "")
		return
	}

	classifyInt, _ = strconv.Atoi(classify)
	w := service.WorkOrder{
		Classify: classifyInt,
		GinObj:   c,
	}
	result, err = w.WorkOrderList()
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("查詢工單數據失敗，%v", err.Error()))
		return
	}

	app.OK(c, result, "")
}

// 處理工單
func ProcessWorkOrder(c *gin.Context) {
	var (
		err           error
		userAuthority bool
		handle        service.Handle
		params        struct {
			Tasks          []string
			TargetState    string                   `json:"target_state"`    // 目標狀態
			SourceState    string                   `json:"source_state"`    // 源狀態
			WorkOrderId    int                      `json:"work_order_id"`   // 工單ID
			Circulation    string                   `json:"circulation"`     // 流轉ID
			FlowProperties int                      `json:"flow_properties"` // 流轉類型 0 拒絕，1 同意，2 其他
			Remarks        string                   `json:"remarks"`         // 處理的備註訊息
			Tpls           []map[string]interface{} `json:"tpls"`            // 表單數據
			IsExecTask     bool                     `json:"is_exec_task"`    // 是否執行任務
		}
	)

	err = c.ShouldBind(&params)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	// 處理工單
	userAuthority, err = service.JudgeUserAuthority(c, params.WorkOrderId, params.SourceState)
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("判斷用戶是否有權限失敗，%v", err.Error()))
		return
	}
	if !userAuthority {
		app.Error(c, -1, errors.New("當前用戶沒有權限進行此操作"), "")
		return
	}

	err = handle.HandleWorkOrder(
		c,
		params.WorkOrderId,    // 工單ID
		params.Tasks,          // 任務列表
		params.TargetState,    // 目標節點
		params.SourceState,    // 源節點
		params.Circulation,    // 流轉標題
		params.FlowProperties, // 流轉屬性
		params.Remarks,        // 備註訊息
		params.Tpls,           // 工單數據更新
		params.IsExecTask,     // 是否執行任務
	)
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("處理工單失敗，%v", err.Error()))
		return
	}

	app.OK(c, nil, "工單處理完成")
}

// 結束工單
func UnityWorkOrder(c *gin.Context) {
	var (
		err           error
		workOrderId   string
		workOrderInfo process.WorkOrderInfo
		userInfo      system.SysUser
	)

	workOrderId = c.DefaultQuery("work_oroder_id", "")
	if workOrderId == "" {
		app.Error(c, -1, errors.New("參數不正確，work_oroder_id"), "")
		return
	}

	tx := orm.Eloquent.Begin()

	// 查詢工單訊息
	err = tx.Model(&workOrderInfo).
		Where("id = ?", workOrderId).
		Find(&workOrderInfo).Error
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("查詢工單失敗，%v", err.Error()))
		return
	}
	if workOrderInfo.IsEnd == 1 {
		app.Error(c, -1, errors.New("工單已結束"), "")
		return
	}

	// 更新工單狀態
	err = tx.Model(&process.WorkOrderInfo{}).
		Where("id = ?", workOrderId).
		Update("is_end", 1).
		Error
	if err != nil {
		tx.Rollback()
		app.Error(c, -1, err, fmt.Sprintf("結束工單失敗，%v", err.Error()))
		return
	}

	// 獲取當前用戶訊息
	err = tx.Model(&userInfo).
		Where("user_id = ?", tools.GetUserId(c)).
		Find(&userInfo).Error
	if err != nil {
		tx.Rollback()
		app.Error(c, -1, err, fmt.Sprintf("當前用戶查詢失敗，%v", err.Error()))
		return
	}

	// 寫入歷史
	tx.Create(&process.CirculationHistory{
		Title:       workOrderInfo.Title,
		WorkOrder:   workOrderInfo.Id,
		State:       "結束工單",
		Circulation: "結束",
		Processor:   userInfo.NickName,
		ProcessorId: tools.GetUserId(c),
		Remarks:     "手動結束工單。",
		Status:      2,
	})

	tx.Commit()

	app.OK(c, nil, "工單已結束")
}

// 轉交工單
func InversionWorkOrder(c *gin.Context) {
	var (
		cirHistoryValue   []process.CirculationHistory
		err               error
		workOrderInfo     process.WorkOrderInfo
		stateList         []map[string]interface{}
		stateValue        []byte
		currentState      map[string]interface{}
		userInfo          system.SysUser
		currentUserInfo   system.SysUser
		costDurationValue int64
		params            struct {
			WorkOrderId int    `json:"work_order_id"`
			NodeId      string `json:"node_id"`
			UserId      int    `json:"user_id"`
			Remarks     string `json:"remarks"`
		}
	)

	// 獲取當前用戶訊息
	err = orm.Eloquent.Model(&currentUserInfo).
		Where("user_id = ?", tools.GetUserId(c)).
		Find(&currentUserInfo).Error
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("當前用戶查詢失敗，%v", err.Error()))
		return
	}

	err = c.ShouldBind(&params)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	// 查詢工單訊息
	err = orm.Eloquent.Model(&workOrderInfo).
		Where("id = ?", params.WorkOrderId).
		Find(&workOrderInfo).Error
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("查詢工單訊息失敗，%v", err.Error()))
		return
	}

	// 序列化節點數據
	err = json.Unmarshal(workOrderInfo.State, &stateList)
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("節點數據反序列化失敗，%v", err.Error()))
		return
	}

	for _, s := range stateList {
		if s["id"].(string) == params.NodeId {
			s["processor"] = []interface{}{params.UserId}
			s["process_method"] = "person"
			currentState = s
			break
		}
	}

	stateValue, err = json.Marshal(stateList)
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("節點數據序列化失敗，%v", err.Error()))
		return
	}

	tx := orm.Eloquent.Begin()

	// 更新數據
	err = tx.Model(&process.WorkOrderInfo{}).
		Where("id = ?", params.WorkOrderId).
		Update("state", stateValue).Error
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("更新節點訊息失敗，%v", err.Error()))
		return
	}

	// 查詢用戶訊息
	err = tx.Model(&system.SysUser{}).
		Where("user_id = ?", params.UserId).
		Find(&userInfo).Error
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("查詢用戶訊息失敗，%v", err.Error()))
		return
	}

	// 流轉歷史寫入
	err = orm.Eloquent.Model(&cirHistoryValue).
		Where("work_order = ?", params.WorkOrderId).
		Find(&cirHistoryValue).
		Order("create_time desc").Error
	if err != nil {
		tx.Rollback()
		return
	}
	for _, t := range cirHistoryValue {
		if t.Source != currentState["id"].(string) {
			costDuration := time.Since(t.CreatedAt.Time)
			costDurationValue = int64(costDuration) / 1000 / 1000 / 1000
		}
	}

	// 添加轉交歷史
	tx.Create(&process.CirculationHistory{
		Title:        workOrderInfo.Title,
		WorkOrder:    workOrderInfo.Id,
		State:        currentState["label"].(string),
		Circulation:  "轉交",
		Processor:    currentUserInfo.NickName,
		ProcessorId:  tools.GetUserId(c),
		Remarks:      fmt.Sprintf("此階段負責人已轉交給《%v》", userInfo.NickName),
		Status:       2, // 其他
		CostDuration: costDurationValue,
	})

	tx.Commit()

	app.OK(c, nil, "工單已手動結單")
}

// 催辦工單
func UrgeWorkOrder(c *gin.Context) {
	var (
		workOrderInfo  process.WorkOrderInfo
		sendToUserList []system.SysUser
		stateList      []interface{}
		userInfo       system.SysUser
	)
	workOrderId := c.DefaultQuery("workOrderId", "")
	if workOrderId == "" {
		app.Error(c, -1, errors.New("參數不正確，缺失workOrderId"), "")
		return
	}

	// 查詢工單數據
	err := orm.Eloquent.Model(&process.WorkOrderInfo{}).Where("id = ?", workOrderId).Find(&workOrderInfo).Error
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("查詢工單訊息失敗，%v", err.Error()))
		return
	}

	// 確認是否可以催辦
	if workOrderInfo.UrgeLastTime != 0 && (int(time.Now().Unix())-workOrderInfo.UrgeLastTime) < 600 {
		app.Error(c, -1, errors.New("十分鐘內無法多次催辦工單。"), "")
		return
	}

	// 獲取當前工單處理人訊息
	err = json.Unmarshal(workOrderInfo.State, &stateList)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	sendToUserList, err = service.GetPrincipalUserInfo(stateList, workOrderInfo.Creator)

	// 查詢創建人訊息
	err = orm.Eloquent.Model(&system.SysUser{}).Where("user_id = ?", workOrderInfo.Creator).Find(&userInfo).Error
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("創建人訊息查詢失敗，%v", err.Error()))
		return
	}

	// 發送催辦提醒
	bodyData := notify.BodyData{
		SendTo: map[string]interface{}{
			"userList": sendToUserList,
		},
		Subject:     "您被催辦工單了，請及時處理。",
		Description: "您有一條待辦工單，請及時處理，工單描述如下",
		Classify:    []int{1}, // todo 1 表示信箱，後續添加了其他的在重新補充
		ProcessId:   workOrderInfo.Process,
		Id:          workOrderInfo.Id,
		Title:       workOrderInfo.Title,
		Creator:     userInfo.NickName,
		Priority:    workOrderInfo.Priority,
		CreatedAt:   workOrderInfo.CreatedAt.Format("2006-01-02 15:04:05"),
	}
	err = bodyData.SendNotify()
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("催辦提醒發送失敗，%v", err.Error()))
		return
	}

	// 更新數據庫
	err = orm.Eloquent.Model(&process.WorkOrderInfo{}).Where("id = ?", workOrderInfo.Id).Updates(map[string]interface{}{
		"urge_count":     workOrderInfo.UrgeCount + 1,
		"urge_last_time": int(time.Now().Unix()),
	}).Error
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("更新催辦訊息失敗，%v", err.Error()))
		return
	}

	app.OK(c, "", "")
}

// 主動處理
func ActiveOrder(c *gin.Context) {
	var (
		workOrderId string
		err         error
		stateValue  []struct {
			ID            string `json:"id"`
			Label         string `json:"label"`
			ProcessMethod string `json:"process_method"`
			Processor     []int  `json:"processor"`
		}
		stateValueByte []byte
	)

	workOrderId = c.Param("id")

	err = c.ShouldBind(&stateValue)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	stateValueByte, err = json.Marshal(stateValue)
	if err != nil {
		app.Error(c, -1, fmt.Errorf("轉byte失敗，%v", err.Error()), "")
		return
	}

	err = orm.Eloquent.Model(&process.WorkOrderInfo{}).
		Where("id = ?", workOrderId).
		Update("state", stateValueByte).Error
	if err != nil {
		app.Error(c, -1, fmt.Errorf("接單失敗，%v", err.Error()), "")
		return
	}

	app.OK(c, "", "接單成功，請及時處理")
}

// 刪除工單
func DeleteWorkOrder(c *gin.Context) {

	workOrderId := c.Param("id")

	err := orm.Eloquent.Delete(&process.WorkOrderInfo{}, workOrderId).Error
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, "", "工單已刪除")
}

// 重開工單
func ReopenWorkOrder(c *gin.Context) {
	var (
		err           error
		id            string
		workOrder     process.WorkOrderInfo
		processInfo   process.Info
		structure     map[string]interface{}
		startId       string
		label         string
		jsonState     []byte
		relatedPerson []byte
		newWorkOrder  process.WorkOrderInfo
		workOrderData []*process.TplData
	)

	id = c.Param("id")

	// 查詢當前ID的工單訊息
	err = orm.Eloquent.Find(&workOrder, id).Error
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("查詢工單訊息失敗, %s", err.Error()))
		return
	}

	// 創建新的工單
	err = orm.Eloquent.Find(&processInfo, workOrder.Process).Error
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("查詢流程訊息失敗, %s", err.Error()))
		return
	}
	err = json.Unmarshal(processInfo.Structure, &structure)
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("Json序列化失敗, %s", err.Error()))
		return
	}
	for _, node := range structure["nodes"].([]interface{}) {
		if node.(map[string]interface{})["clazz"] == "start" {
			startId = node.(map[string]interface{})["id"].(string)
			label = node.(map[string]interface{})["label"].(string)
		}
	}

	state := []map[string]interface{}{
		{"id": startId, "label": label, "processor": []int{tools.GetUserId(c)}, "process_method": "person"},
	}
	jsonState, err = json.Marshal(state)
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("Json序列化失敗, %s", err.Error()))
		return
	}

	relatedPerson, err = json.Marshal([]int{tools.GetUserId(c)})
	if err != nil {
		app.Error(c, -1, err, fmt.Sprintf("Json序列化失敗, %s", err.Error()))
		return
	}

	tx := orm.Eloquent.Begin()

	newWorkOrder = process.WorkOrderInfo{
		Title:         workOrder.Title,
		Priority:      workOrder.Priority,
		Process:       workOrder.Process,
		Classify:      workOrder.Classify,
		State:         jsonState,
		RelatedPerson: relatedPerson,
		Creator:       tools.GetUserId(c),
	}
	err = tx.Create(&newWorkOrder).Error
	if err != nil {
		tx.Rollback()
		app.Error(c, -1, err, fmt.Sprintf("新建工單失敗, %s", err.Error()))
		return
	}

	// 查詢工單數據
	err = orm.Eloquent.Model(&process.TplData{}).Where("work_order = ?", id).Find(&workOrderData).Error
	if err != nil {
		tx.Rollback()
		app.Error(c, -1, err, fmt.Sprintf("查詢工單數據失敗, %s", err.Error()))
		return
	}

	for _, d := range workOrderData {
		d.WorkOrder = newWorkOrder.Id
		d.Id = 0
		err = tx.Create(d).Error
		if err != nil {
			tx.Rollback()
			app.Error(c, -1, err, fmt.Sprintf("創建工單數據失敗, %s", err.Error()))
			return
		}
	}

	tx.Commit()

	app.OK(c, nil, "")
}
