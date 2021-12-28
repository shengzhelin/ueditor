package service

import (
	"encoding/json"
	"errors"
	"ferry/global/orm"
	"ferry/models/base"
	"ferry/models/process"
	"ferry/models/system"
	"ferry/pkg/notify"
	"ferry/tools"
	"fmt"
	"reflect"
	"time"

	"github.com/jinzhu/gorm"

	"github.com/gin-gonic/gin"
)

/*
  @Author : lanyulei
  @Desc : 處理工單
*/

/*
    -- 節點 --
	start: 開始節點
	userTask: 審批節點
	receiveTask: 處理節點
	scriptTask: 任務節點
	end: 結束節點

    -- 網關 --
    exclusiveGateway: 排他網關
    parallelGateway: 並行網關
    inclusiveGateway: 包容網關

*/

type Handle struct {
	cirHistoryList   []process.CirculationHistory
	workOrderId      int
	updateValue      map[string]interface{}
	stateValue       map[string]interface{}
	targetStateValue map[string]interface{}
	WorkOrderData    [][]byte
	workOrderDetails process.WorkOrderInfo
	endHistory       bool
	flowProperties   int
	circulationValue string
	processState     ProcessState
	tx               *gorm.DB
}

// 會簽
func (h *Handle) Countersign(c *gin.Context) (err error) {
	var (
		stateList         []map[string]interface{}
		stateIdMap        map[string]interface{}
		currentState      map[string]interface{}
		cirHistoryCount   int
		userInfoList      []system.SysUser
		circulationStatus bool
	)

	err = json.Unmarshal(h.workOrderDetails.State, &stateList)
	if err != nil {
		return
	}

	stateIdMap = make(map[string]interface{})
	for _, v := range stateList {
		stateIdMap[v["id"].(string)] = v["label"]
		if v["id"].(string) == h.stateValue["id"].(string) {
			currentState = v
		}
	}
	userStatusCount := 0
	circulationStatus = false
	for _, cirHistoryValue := range h.cirHistoryList {
		if len(currentState["processor"].([]interface{})) > 1 {
			if _, ok := stateIdMap[cirHistoryValue.Source]; !ok {
				break
			}
		}

		if currentState["process_method"].(string) == "person" {
			// 用戶會簽
			for _, processor := range currentState["processor"].([]interface{}) {
				if cirHistoryValue.ProcessorId != tools.GetUserId(c) &&
					cirHistoryValue.Source == currentState["id"].(string) &&
					cirHistoryValue.ProcessorId == int(processor.(float64)) {
					cirHistoryCount += 1
				}
			}
			if cirHistoryCount == len(currentState["processor"].([]interface{}))-1 {
				circulationStatus = true
				break
			}
		} else if currentState["process_method"].(string) == "role" || currentState["process_method"].(string) == "department" {
			// 全員處理
			var tmpUserList []system.SysUser
			if h.stateValue["fullHandle"].(bool) {
				db := orm.Eloquent.Model(&system.SysUser{})
				if currentState["process_method"].(string) == "role" {
					db = db.Where("role_id in (?)", currentState["processor"].([]interface{}))
				} else if currentState["process_method"].(string) == "department" {
					db = db.Where("dept_id in (?)", currentState["processor"].([]interface{}))
				}
				err = db.Find(&userInfoList).Error
				if err != nil {
					return
				}
				temp := map[string]struct{}{}
				for _, user := range userInfoList {
					if _, ok := temp[user.Username]; !ok {
						temp[user.Username] = struct{}{}
						tmpUserList = append(tmpUserList, user)
					}
				}
				for _, user := range tmpUserList {
					if cirHistoryValue.Source == currentState["id"].(string) &&
						cirHistoryValue.ProcessorId != tools.GetUserId(c) &&
						cirHistoryValue.ProcessorId == user.UserId {
						userStatusCount += 1
						break
					}
				}
			} else {
				// 普通會簽
				for _, processor := range currentState["processor"].([]interface{}) {
					db := orm.Eloquent.Model(&system.SysUser{})
					if currentState["process_method"].(string) == "role" {
						db = db.Where("role_id = ?", processor)
					} else if currentState["process_method"].(string) == "department" {
						db = db.Where("dept_id = ?", processor)
					}
					err = db.Find(&userInfoList).Error
					if err != nil {
						return
					}
					for _, user := range userInfoList {
						if user.UserId != tools.GetUserId(c) &&
							cirHistoryValue.Source == currentState["id"].(string) &&
							cirHistoryValue.ProcessorId == user.UserId {
							userStatusCount += 1
							break
						}
					}
				}
			}
			if h.stateValue["fullHandle"].(bool) {
				if userStatusCount == len(tmpUserList)-1 {
					circulationStatus = true
				}
			} else {
				if userStatusCount == len(currentState["processor"].([]interface{}))-1 {
					circulationStatus = true
				}
			}
		}
	}
	if circulationStatus {
		h.endHistory = true
		err = h.circulation()
		if err != nil {
			return
		}
	}
	return
}

// 工單跳轉
func (h *Handle) circulation() (err error) {
	var (
		stateValue []byte
	)

	stateList := make([]interface{}, 0)
	for _, v := range h.updateValue["state"].([]map[string]interface{}) {
		stateList = append(stateList, v)
	}
	err = GetVariableValue(stateList, h.workOrderDetails.Creator)
	if err != nil {
		return
	}

	stateValue, err = json.Marshal(h.updateValue["state"])
	if err != nil {
		return
	}

	err = h.tx.Model(&process.WorkOrderInfo{}).
		Where("id = ?", h.workOrderId).
		Updates(map[string]interface{}{
			"state":          stateValue,
			"is_denied":      h.flowProperties,
			"related_person": h.updateValue["related_person"],
		}).Error
	if err != nil {
		h.tx.Rollback()
		return
	}

	// 如果是跳轉到結束節點，則需要修改節點狀態
	if h.targetStateValue["clazz"] == "end" {
		err = h.tx.Model(&process.WorkOrderInfo{}).
			Where("id = ?", h.workOrderId).
			Update("is_end", 1).Error
		if err != nil {
			h.tx.Rollback()
			return
		}
	}

	return
}

// 條件判斷
func (h *Handle) ConditionalJudgment(condExpr map[string]interface{}) (result bool, err error) {
	var (
		condExprOk    bool
		condExprValue interface{}
	)

	defer func() {
		if r := recover(); r != nil {
			switch e := r.(type) {
			case string:
				err = errors.New(e)
			case error:
				err = e
			default:
				err = errors.New("未知錯誤")
			}
			return
		}
	}()

	for _, data := range h.WorkOrderData {
		var formData map[string]interface{}
		err = json.Unmarshal(data, &formData)
		if err != nil {
			return
		}
		if condExprValue, condExprOk = formData[condExpr["key"].(string)]; condExprOk {
			break
		}
	}

	if condExprValue == nil {
		err = errors.New("未查詢到對應的表單數據。")
		return
	}

	// todo 待優化
	switch reflect.TypeOf(condExprValue).String() {
	case "string":
		switch condExpr["sign"] {
		case "==":
			if condExprValue.(string) == condExpr["value"].(string) {
				result = true
			}
		case "!=":
			if condExprValue.(string) != condExpr["value"].(string) {
				result = true
			}
		case ">":
			if condExprValue.(string) > condExpr["value"].(string) {
				result = true
			}
		case ">=":
			if condExprValue.(string) >= condExpr["value"].(string) {
				result = true
			}
		case "<":
			if condExprValue.(string) < condExpr["value"].(string) {
				result = true
			}
		case "<=":
			if condExprValue.(string) <= condExpr["value"].(string) {
				result = true
			}
		default:
			err = errors.New("目前僅支持6種常規判斷類型，包括（等於、不等於、大於、大於等於、小於、小於等於）")
		}
	case "float64":
		switch condExpr["sign"] {
		case "==":
			if condExprValue.(float64) == condExpr["value"].(float64) {
				result = true
			}
		case "!=":
			if condExprValue.(float64) != condExpr["value"].(float64) {
				result = true
			}
		case ">":
			if condExprValue.(float64) > condExpr["value"].(float64) {
				result = true
			}
		case ">=":
			if condExprValue.(float64) >= condExpr["value"].(float64) {
				result = true
			}
		case "<":
			if condExprValue.(float64) < condExpr["value"].(float64) {
				result = true
			}
		case "<=":
			if condExprValue.(float64) <= condExpr["value"].(float64) {
				result = true
			}
		default:
			err = errors.New("目前僅支持6種常規判斷類型，包括（等於、不等於、大於、大於等於、小於、小於等於）")
		}
	default:
		err = errors.New("條件判斷目前僅支持字符串、整型。")
	}

	return
}

// 並行網關，確認其他節點是否完成
func (h *Handle) completeAllParallel(target string) (statusOk bool, err error) {
	var (
		stateList []map[string]interface{}
	)

	err = json.Unmarshal(h.workOrderDetails.State, &stateList)
	if err != nil {
		err = fmt.Errorf("反序列化失敗，%v", err.Error())
		return
	}

continueHistoryTag:
	for _, v := range h.cirHistoryList {
		status := false
		for i, s := range stateList {
			if v.Source == s["id"].(string) && v.Target == target {
				status = true
				stateList = append(stateList[:i], stateList[i+1:]...)
				continue continueHistoryTag
			}
		}
		if !status {
			break
		}
	}

	if len(stateList) == 1 && stateList[0]["id"].(string) == h.stateValue["id"] {
		statusOk = true
	}

	return
}

func (h *Handle) commonProcessing(c *gin.Context) (err error) {
	// 如果是拒絕的流轉則直接跳轉
	if h.flowProperties == 0 {
		err = h.circulation()
		if err != nil {
			err = fmt.Errorf("工單跳轉失敗，%v", err.Error())
		}
		return
	}

	// 會簽
	if h.stateValue["assignValue"] != nil && len(h.stateValue["assignValue"].([]interface{})) > 0 {
		if isCounterSign, ok := h.stateValue["isCounterSign"]; ok {
			if isCounterSign.(bool) {
				h.endHistory = false
				err = h.Countersign(c)
				if err != nil {
					return
				}
			} else {
				err = h.circulation()
				if err != nil {
					return
				}
			}
		} else {
			err = h.circulation()
			if err != nil {
				return
			}
		}
	} else {
		err = h.circulation()
		if err != nil {
			return
		}
	}
	return
}

func (h *Handle) HandleWorkOrder(
	c *gin.Context,
	workOrderId int,
	tasks []string,
	targetState string,
	sourceState string,
	circulationValue string,
	flowProperties int,
	remarks string,
	tpls []map[string]interface{},
	isExecTask bool,
) (err error) {
	h.workOrderId = workOrderId
	h.flowProperties = flowProperties
	h.endHistory = true

	var (
		execTasks          []string
		relatedPersonList  []int
		cirHistoryValue    []process.CirculationHistory
		cirHistoryData     process.CirculationHistory
		costDurationValue  int64
		sourceEdges        []map[string]interface{}
		targetEdges        []map[string]interface{}
		condExprStatus     bool
		relatedPersonValue []byte
		parallelStatusOk   bool
		processInfo        process.Info
		currentUserInfo    system.SysUser
		applyUserInfo      system.SysUser
		sendToUserList     []system.SysUser
		noticeList         []int
		sendSubject        string = "您有一條待辦工單，請及時處理"
		sendDescription    string = "您有一條待辦工單請及時處理，工單描述如下"
		paramsValue        struct {
			Id       int           `json:"id"`
			Title    string        `json:"title"`
			Priority int           `json:"priority"`
			FormData []interface{} `json:"form_data"`
		}
	)

	defer func() {
		if r := recover(); r != nil {
			switch e := r.(type) {
			case string:
				err = errors.New(e)
			case error:
				err = e
			default:
				err = errors.New("未知錯誤")
			}
			return
		}
	}()

	// 獲取工單訊息
	err = orm.Eloquent.Model(&process.WorkOrderInfo{}).Where("id = ?", workOrderId).Find(&h.workOrderDetails).Error
	if err != nil {
		return
	}

	// 查詢工單創建人訊息
	err = orm.Eloquent.Model(&system.SysUser{}).Where("user_id = ?", h.workOrderDetails.Creator).Find(&applyUserInfo).Error
	if err != nil {
		return
	}

	// 獲取流程訊息
	err = orm.Eloquent.Model(&process.Info{}).Where("id = ?", h.workOrderDetails.Process).Find(&processInfo).Error
	if err != nil {
		return
	}
	err = json.Unmarshal(processInfo.Structure, &h.processState.Structure)
	if err != nil {
		return
	}

	// 獲取當前節點
	h.stateValue, err = h.processState.GetNode(sourceState)
	if err != nil {
		return
	}

	// 目標狀態
	h.targetStateValue, err = h.processState.GetNode(targetState)
	if err != nil {
		return
	}

	// 獲取工單數據
	err = orm.Eloquent.Model(&process.TplData{}).
		Where("work_order = ?", workOrderId).
		Pluck("form_data", &h.WorkOrderData).Error
	if err != nil {
		return
	}

	// 根據處理人查詢出需要會簽的條數
	err = orm.Eloquent.Model(&process.CirculationHistory{}).
		Where("work_order = ?", workOrderId).
		Order("id desc").
		Find(&h.cirHistoryList).Error
	if err != nil {
		return
	}

	err = json.Unmarshal(h.workOrderDetails.RelatedPerson, &relatedPersonList)
	if err != nil {
		return
	}
	relatedPersonStatus := false
	for _, r := range relatedPersonList {
		if r == tools.GetUserId(c) {
			relatedPersonStatus = true
			break
		}
	}
	if !relatedPersonStatus {
		relatedPersonList = append(relatedPersonList, tools.GetUserId(c))
	}

	relatedPersonValue, err = json.Marshal(relatedPersonList)
	if err != nil {
		return
	}

	h.updateValue = map[string]interface{}{
		"related_person": relatedPersonValue,
	}

	// 開啟事務
	h.tx = orm.Eloquent.Begin()

	stateValue := map[string]interface{}{
		"label": h.targetStateValue["label"].(string),
		"id":    h.targetStateValue["id"].(string),
	}

	sourceEdges, err = h.processState.GetEdge(h.targetStateValue["id"].(string), "source")
	if err != nil {
		return
	}

	switch h.targetStateValue["clazz"] {
	case "exclusiveGateway": // 排他網關
	breakTag:
		for _, edge := range sourceEdges {
			edgeCondExpr := make([]map[string]interface{}, 0)
			err = json.Unmarshal([]byte(edge["conditionExpression"].(string)), &edgeCondExpr)
			if err != nil {
				return
			}
			for _, condExpr := range edgeCondExpr {
				// 條件判斷
				condExprStatus, err = h.ConditionalJudgment(condExpr)
				if err != nil {
					return
				}
				if condExprStatus {
					// 進行節點跳轉
					h.targetStateValue, err = h.processState.GetNode(edge["target"].(string))
					if err != nil {
						return
					}

					if h.targetStateValue["clazz"] == "userTask" || h.targetStateValue["clazz"] == "receiveTask" {
						if h.targetStateValue["assignValue"] == nil || h.targetStateValue["assignType"] == "" {
							err = errors.New("處理人不能為空")
							return
						}
					}

					h.updateValue["state"] = []map[string]interface{}{{
						"id":             h.targetStateValue["id"].(string),
						"label":          h.targetStateValue["label"],
						"processor":      h.targetStateValue["assignValue"],
						"process_method": h.targetStateValue["assignType"],
					}}
					err = h.commonProcessing(c)
					if err != nil {
						err = fmt.Errorf("流程流程跳轉失敗，%v", err.Error())
						return
					}

					break breakTag
				}
			}
		}
		if !condExprStatus {
			err = errors.New("所有流轉均不符合條件，請確認。")
			return
		}
	case "parallelGateway": // 並行/聚合網關
		// 入口，判斷
		targetEdges, err = h.processState.GetEdge(h.targetStateValue["id"].(string), "target")
		if err != nil {
			err = fmt.Errorf("查詢流轉訊息失敗，%v", err.Error())
			return
		}

		if len(sourceEdges) > 0 {
			h.targetStateValue, err = h.processState.GetNode(sourceEdges[0]["target"].(string))
			if err != nil {
				return
			}
		} else {
			err = errors.New("並行網關流程不正確")
			return
		}

		if len(sourceEdges) > 1 && len(targetEdges) == 1 {
			// 入口
			h.updateValue["state"] = make([]map[string]interface{}, 0)
			for _, edge := range sourceEdges {
				targetStateValue, err := h.processState.GetNode(edge["target"].(string))
				if err != nil {
					return err
				}
				h.updateValue["state"] = append(h.updateValue["state"].([]map[string]interface{}), map[string]interface{}{
					"id":             edge["target"].(string),
					"label":          targetStateValue["label"],
					"processor":      targetStateValue["assignValue"],
					"process_method": targetStateValue["assignType"],
				})
			}
			err = h.circulation()
			if err != nil {
				err = fmt.Errorf("工單跳轉失敗，%v", err.Error())
				return
			}
		} else if len(sourceEdges) == 1 && len(targetEdges) > 1 {
			// 出口
			parallelStatusOk, err = h.completeAllParallel(sourceEdges[0]["target"].(string))
			if err != nil {
				err = fmt.Errorf("並行檢測失敗，%v", err.Error())
				return
			}
			if parallelStatusOk {
				h.endHistory = true
				endAssignValue, ok := h.targetStateValue["assignValue"]
				if !ok {
					endAssignValue = []int{}
				}

				endAssignType, ok := h.targetStateValue["assignType"]
				if !ok {
					endAssignType = ""
				}

				h.updateValue["state"] = []map[string]interface{}{{
					"id":             h.targetStateValue["id"].(string),
					"label":          h.targetStateValue["label"],
					"processor":      endAssignValue,
					"process_method": endAssignType,
				}}
				err = h.circulation()
				if err != nil {
					err = fmt.Errorf("工單跳轉失敗，%v", err.Error())
					return
				}
			} else {
				h.endHistory = false
			}

		} else {
			err = errors.New("並行網關流程不正確")
			return
		}
	// 包容網關
	case "inclusiveGateway":
		return
	case "start":
		stateValue["processor"] = []int{h.workOrderDetails.Creator}
		stateValue["process_method"] = "person"
		h.updateValue["state"] = []map[string]interface{}{stateValue}
		err = h.circulation()
		if err != nil {
			return
		}
	case "userTask":
		stateValue["processor"] = h.targetStateValue["assignValue"].([]interface{})
		stateValue["process_method"] = h.targetStateValue["assignType"].(string)
		h.updateValue["state"] = []map[string]interface{}{stateValue}
		err = h.commonProcessing(c)
		if err != nil {
			return
		}
	case "receiveTask":
		stateValue["processor"] = h.targetStateValue["assignValue"].([]interface{})
		stateValue["process_method"] = h.targetStateValue["assignType"].(string)
		h.updateValue["state"] = []map[string]interface{}{stateValue}
		err = h.commonProcessing(c)
		if err != nil {
			return
		}
	case "scriptTask":
		stateValue["processor"] = []int{}
		stateValue["process_method"] = ""
		h.updateValue["state"] = []map[string]interface{}{stateValue}
	case "end":
		stateValue["processor"] = []int{}
		stateValue["process_method"] = ""
		h.updateValue["state"] = []map[string]interface{}{stateValue}
		err = h.commonProcessing(c)
		if err != nil {
			return
		}
	}

	// 更新表單數據
	for _, t := range tpls {
		var (
			tplValue []byte
		)
		tplValue, err = json.Marshal(t["tplValue"])
		if err != nil {
			h.tx.Rollback()
			return
		}

		paramsValue.FormData = append(paramsValue.FormData, t["tplValue"])

		// 是否可寫，只有可寫的模版可以更新數據
		updateStatus := false
		if h.stateValue["clazz"].(string) == "start" {
			updateStatus = true
		} else if writeTplList, writeOK := h.stateValue["writeTpls"]; writeOK {
		tplListTag:
			for _, writeTplId := range writeTplList.([]interface{}) {
				if writeTplId == t["tplId"] { // 可寫
					// 是否隱藏，隱藏的模版無法修改數據
					if hideTplList, hideOK := h.stateValue["hideTpls"]; hideOK {
						if hideTplList != nil && len(hideTplList.([]interface{})) > 0 {
							for _, hideTplId := range hideTplList.([]interface{}) {
								if hideTplId == t["tplId"] { // 隱藏的
									updateStatus = false
									break tplListTag
								} else {
									updateStatus = true
								}
							}
						} else {
							updateStatus = true
						}
					} else {
						updateStatus = true
					}
				}
			}
		} else {
			// 不可寫
			updateStatus = false
		}
		if updateStatus {
			err = h.tx.Model(&process.TplData{}).Where("id = ?", t["tplDataId"]).Update("form_data", tplValue).Error
			if err != nil {
				h.tx.Rollback()
				return
			}
		}
	}

	// 流轉歷史寫入
	err = orm.Eloquent.Model(&cirHistoryValue).
		Where("work_order = ?", workOrderId).
		Find(&cirHistoryValue).
		Order("create_time desc").Error
	if err != nil {
		h.tx.Rollback()
		return
	}
	for _, t := range cirHistoryValue {
		if t.Source != h.stateValue["id"] {
			costDuration := time.Since(t.CreatedAt.Time)
			costDurationValue = int64(costDuration) / 1000 / 1000 / 1000
		}
	}

	// 獲取當前用戶訊息
	err = orm.Eloquent.Model(&currentUserInfo).
		Where("user_id = ?", tools.GetUserId(c)).
		Find(&currentUserInfo).Error
	if err != nil {
		return
	}

	cirHistoryData = process.CirculationHistory{
		Model:        base.Model{},
		Title:        h.workOrderDetails.Title,
		WorkOrder:    h.workOrderDetails.Id,
		State:        h.stateValue["label"].(string),
		Source:       h.stateValue["id"].(string),
		Target:       h.targetStateValue["id"].(string),
		Circulation:  circulationValue,
		Processor:    currentUserInfo.NickName,
		ProcessorId:  tools.GetUserId(c),
		Status:       flowProperties,
		CostDuration: costDurationValue,
		Remarks:      remarks,
	}
	err = h.tx.Create(&cirHistoryData).Error
	if err != nil {
		h.tx.Rollback()
		return
	}

	// 獲取流程通知類型列表
	err = json.Unmarshal(processInfo.Notice, &noticeList)
	if err != nil {
		return
	}

	// 獲取需要抄送的郵件
	emailCCList := make([]string, 0)
	if h.stateValue["cc"] != nil && len(h.stateValue["cc"].([]interface{})) > 0 {
		err = orm.Eloquent.Model(&system.SysUser{}).
			Where("user_id in (?)", h.stateValue["cc"]).
			Pluck("email", &emailCCList).Error
		if err != nil {
			err = errors.New("查詢郵件抄送人失敗")
			return
		}
	}

	bodyData := notify.BodyData{
		SendTo: map[string]interface{}{
			"userList": sendToUserList,
		},
		EmailCcTo:   emailCCList,
		Subject:     sendSubject,
		Description: sendDescription,
		Classify:    noticeList,
		ProcessId:   h.workOrderDetails.Process,
		Id:          h.workOrderDetails.Id,
		Title:       h.workOrderDetails.Title,
		Creator:     applyUserInfo.NickName,
		Priority:    h.workOrderDetails.Priority,
		CreatedAt:   h.workOrderDetails.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	// 判斷目標是否是結束節點
	if h.targetStateValue["clazz"] == "end" && h.endHistory == true {
		sendSubject = "您的工單已處理完成"
		sendDescription = "您的工單已處理完成，工單描述如下"
		err = h.tx.Create(&process.CirculationHistory{
			Model:       base.Model{},
			Title:       h.workOrderDetails.Title,
			WorkOrder:   h.workOrderDetails.Id,
			State:       h.targetStateValue["label"].(string),
			Source:      h.targetStateValue["id"].(string),
			Processor:   currentUserInfo.NickName,
			ProcessorId: tools.GetUserId(c),
			Circulation: "結束",
			Remarks:     "工單已結束",
			Status:      2, // 其他狀態
		}).Error
		if err != nil {
			h.tx.Rollback()
			return
		}
		if len(noticeList) > 0 {
			// 查詢工單創建人訊息
			err = h.tx.Model(&system.SysUser{}).
				Where("user_id = ?", h.workOrderDetails.Creator).
				Find(&sendToUserList).Error
			if err != nil {
				return
			}

			bodyData.SendTo = map[string]interface{}{
				"userList": sendToUserList,
			}
			bodyData.Subject = sendSubject
			bodyData.Description = sendDescription

			// 發送通知
			go func(bodyData notify.BodyData) {
				err = bodyData.SendNotify()
				if err != nil {
					return
				}
			}(bodyData)
		}
	}

	h.tx.Commit() // 提交事務

	// 發送通知
	if len(noticeList) > 0 {
		stateList := make([]interface{}, 0)
		for _, v := range h.updateValue["state"].([]map[string]interface{}) {
			stateList = append(stateList, v)
		}
		sendToUserList, err = GetPrincipalUserInfo(stateList, h.workOrderDetails.Creator)
		if err != nil {
			return
		}

		bodyData.SendTo = map[string]interface{}{
			"userList": sendToUserList,
		}
		bodyData.Subject = sendSubject
		bodyData.Description = sendDescription

		// 發送通知
		go func(bodyData notify.BodyData) {
			err = bodyData.SendNotify()
			if err != nil {
				return
			}
		}(bodyData)
	}

	if isExecTask {
		// 執行流程公共任務及節點任務
		if h.stateValue["task"] != nil {
			for _, task := range h.stateValue["task"].([]interface{}) {
				tasks = append(tasks, task.(string))
			}
		}
	continueTag:
		for _, task := range tasks {
			for _, t := range execTasks {
				if t == task {
					continue continueTag
				}
			}
			execTasks = append(execTasks, task)
		}

		paramsValue.Id = h.workOrderDetails.Id
		paramsValue.Title = h.workOrderDetails.Title
		paramsValue.Priority = h.workOrderDetails.Priority
		params, err := json.Marshal(paramsValue)
		if err != nil {
			return err
		}
		go ExecTask(execTasks, string(params))
	}
	return
}
