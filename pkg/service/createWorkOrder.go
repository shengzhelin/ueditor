package service

import (
	"encoding/json"
	"errors"
	"ferry/global/orm"
	"ferry/models/process"
	"ferry/models/system"
	"ferry/pkg/notify"
	"ferry/tools"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

/*
  @Author : lanyulei
*/

func CreateWorkOrder(c *gin.Context) (err error) {
	var (
		taskList       []string
		stateList      []interface{}
		userInfo       system.SysUser
		variableValue  []interface{}
		processValue   process.Info
		sendToUserList []system.SysUser
		noticeList     []int
		handle         Handle
		processState   ProcessState
		condExprStatus bool
		tpl            []byte
		sourceEdges    []map[string]interface{}
		targetEdges    []map[string]interface{}
		currentNode    map[string]interface{}
		workOrderValue struct {
			process.WorkOrderInfo
			Tpls        map[string][]interface{} `json:"tpls"`
			SourceState string                   `json:"source_state"`
			Tasks       json.RawMessage          `json:"tasks"`
			Source      string                   `json:"source"`
			IsExecTask  bool                     `json:"is_exec_task"`
		}
		paramsValue struct {
			Id       int           `json:"id"`
			Title    string        `json:"title"`
			Priority int           `json:"priority"`
			FormData []interface{} `json:"form_data"`
		}
	)

	err = c.ShouldBind(&workOrderValue)
	if err != nil {
		return
	}

	relatedPerson, err := json.Marshal([]int{tools.GetUserId(c)})
	if err != nil {
		return
	}

	// 獲取變量值
	err = json.Unmarshal(workOrderValue.State, &variableValue)
	if err != nil {
		return
	}
	err = GetVariableValue(variableValue, tools.GetUserId(c))
	if err != nil {
		err = fmt.Errorf("獲取處理人變量值失敗，%v", err.Error())
		return
	}

	// 創建工單數據
	tx := orm.Eloquent.Begin()

	// 查詢流程信息
	err = tx.Model(&processValue).Where("id = ?", workOrderValue.Process).Find(&processValue).Error
	if err != nil {
		return
	}

	err = json.Unmarshal(processValue.Structure, &processState.Structure)

	for _, node := range processState.Structure["nodes"] {
		if node["clazz"] == "start" {
			currentNode = node
		}
	}

	nodeValue, err := processState.GetNode(variableValue[0].(map[string]interface{})["id"].(string))
	if err != nil {
		return
	}

	for _, v := range workOrderValue.Tpls["form_data"] {
		tpl, err = json.Marshal(v)
		if err != nil {
			return
		}
		handle.WorkOrderData = append(handle.WorkOrderData, tpl)
	}

	switch nodeValue["clazz"] {
	// 排他網關
	case "exclusiveGateway":
		var sourceEdges []map[string]interface{}
		sourceEdges, err = processState.GetEdge(nodeValue["id"].(string), "source")
		if err != nil {
			return
		}
	breakTag:
		for _, edge := range sourceEdges {
			edgeCondExpr := make([]map[string]interface{}, 0)
			err = json.Unmarshal([]byte(edge["conditionExpression"].(string)), &edgeCondExpr)
			if err != nil {
				return
			}
			for _, condExpr := range edgeCondExpr {
				// 條件判斷
				condExprStatus, err = handle.ConditionalJudgment(condExpr)
				if err != nil {
					return
				}
				if condExprStatus {
					// 進行節點跳轉
					nodeValue, err = processState.GetNode(edge["target"].(string))
					if err != nil {
						return
					}

					if nodeValue["clazz"] == "userTask" || nodeValue["clazz"] == "receiveTask" {
						if nodeValue["assignValue"] == nil || nodeValue["assignType"] == "" {
							err = errors.New("處理人不能為空")
							return
						}
					}
					variableValue[0].(map[string]interface{})["id"] = nodeValue["id"].(string)
					variableValue[0].(map[string]interface{})["label"] = nodeValue["label"]
					variableValue[0].(map[string]interface{})["processor"] = nodeValue["assignValue"]
					variableValue[0].(map[string]interface{})["process_method"] = nodeValue["assignType"]
					break breakTag
				}
			}
		}
		if !condExprStatus {
			err = errors.New("所有流轉均不符合條件，請確認。")
			return
		}
	case "parallelGateway":
		// 入口，判斷
		sourceEdges, err = processState.GetEdge(nodeValue["id"].(string), "source")
		if err != nil {
			err = fmt.Errorf("查詢流轉信息失敗，%v", err.Error())
			return
		}

		targetEdges, err = processState.GetEdge(nodeValue["id"].(string), "target")
		if err != nil {
			err = fmt.Errorf("查詢流轉信息失敗，%v", err.Error())
			return
		}

		if len(sourceEdges) > 0 {
			nodeValue, err = processState.GetNode(sourceEdges[0]["target"].(string))
			if err != nil {
				return
			}
		} else {
			err = errors.New("並行網關流程不正確")
			return
		}

		if len(sourceEdges) > 1 && len(targetEdges) == 1 {
			// 入口
			variableValue = []interface{}{}
			for _, edge := range sourceEdges {
				targetStateValue, err := processState.GetNode(edge["target"].(string))
				if err != nil {
					return err
				}
				variableValue = append(variableValue, map[string]interface{}{
					"id":             edge["target"].(string),
					"label":          targetStateValue["label"],
					"processor":      targetStateValue["assignValue"],
					"process_method": targetStateValue["assignType"],
				})
			}
		} else {
			err = errors.New("並行網關流程配置不正確")
			return
		}
	}

	// 獲取變量數據
	err = GetVariableValue(variableValue, tools.GetUserId(c))
	if err != nil {
		return
	}

	workOrderValue.State, err = json.Marshal(variableValue)
	if err != nil {
		return
	}

	var workOrderInfo = process.WorkOrderInfo{
		Title:         workOrderValue.Title,
		Priority:      workOrderValue.Priority,
		Process:       workOrderValue.Process,
		Classify:      workOrderValue.Classify,
		State:         workOrderValue.State,
		RelatedPerson: relatedPerson,
		Creator:       tools.GetUserId(c),
	}
	err = tx.Create(&workOrderInfo).Error
	if err != nil {
		tx.Rollback()
		err = fmt.Errorf("創建工單失敗，%v", err.Error())
		return
	}

	// 創建工單模版關聯數據
	for i := 0; i < len(workOrderValue.Tpls["form_structure"]); i++ {
		var (
			formDataJson      []byte
			formStructureJson []byte
		)
		formDataJson, err = json.Marshal(workOrderValue.Tpls["form_data"][i])
		if err != nil {
			tx.Rollback()
			err = fmt.Errorf("生成json字符串錯誤，%v", err.Error())
			return
		}
		formStructureJson, err = json.Marshal(workOrderValue.Tpls["form_structure"][i])
		if err != nil {
			tx.Rollback()
			err = fmt.Errorf("生成json字符串錯誤，%v", err.Error())
			return
		}

		formData := process.TplData{
			WorkOrder:     workOrderInfo.Id,
			FormStructure: formStructureJson,
			FormData:      formDataJson,
		}

		err = tx.Create(&formData).Error
		if err != nil {
			tx.Rollback()
			err = fmt.Errorf("創建工單模版關聯數據失敗，%v", err.Error())
			return
		}
	}

	// 獲取當前用戶信息
	err = tx.Model(&system.SysUser{}).Where("user_id = ?", tools.GetUserId(c)).Find(&userInfo).Error
	if err != nil {
		tx.Rollback()
		err = fmt.Errorf("查詢用戶信息失敗，%v", err.Error())
		return
	}

	nameValue := userInfo.NickName
	if nameValue == "" {
		nameValue = userInfo.Username
	}

	// 創建歷史記錄
	err = json.Unmarshal(workOrderInfo.State, &stateList)
	if err != nil {
		tx.Rollback()
		err = fmt.Errorf("json序列化失敗，%s", err.Error())
		return
	}
	err = tx.Create(&process.CirculationHistory{
		Title:       workOrderValue.Title,
		WorkOrder:   workOrderInfo.Id,
		State:       workOrderValue.SourceState,
		Source:      workOrderValue.Source,
		Target:      stateList[0].(map[string]interface{})["id"].(string),
		Circulation: "新建",
		Processor:   nameValue,
		ProcessorId: userInfo.UserId,
		Status:      2, // 其他
	}).Error
	if err != nil {
		tx.Rollback()
		err = fmt.Errorf("新建歷史記錄失敗，%v", err.Error())
		return
	}

	// 更新流程提交數量統計
	err = tx.Model(&process.Info{}).
		Where("id = ?", workOrderValue.Process).
		Update("submit_count", processValue.SubmitCount+1).Error
	if err != nil {
		tx.Rollback()
		err = fmt.Errorf("更新流程提交數量統計失敗，%v", err.Error())
		return
	}

	tx.Commit()

	// 發送通知
	err = json.Unmarshal(processValue.Notice, &noticeList)
	if err != nil {
		return
	}
	if len(noticeList) > 0 {
		sendToUserList, err = GetPrincipalUserInfo(stateList, workOrderInfo.Creator)
		if err != nil {
			err = fmt.Errorf("獲取所有處理人的用戶信息失敗，%v", err.Error())
			return
		}

		// 獲取需要抄送的郵件
		emailCCList := make([]string, 0)
		if currentNode["cc"] != nil && len(currentNode["cc"].([]interface{})) > 0 {
			err = orm.Eloquent.Model(&system.SysUser{}).
				Where("user_id in (?)", currentNode["cc"]).
				Pluck("email", &emailCCList).Error
			if err != nil {
				err = errors.New("查詢郵件抄送人失敗")
				return
			}
		}
		// 發送通知
		go func() {
			bodyData := notify.BodyData{
				SendTo: map[string]interface{}{
					"userList": sendToUserList,
				},
				EmailCcTo:   emailCCList,
				Subject:     "您有一條待辦工單，請及時處理",
				Description: "您有一條待辦工單請及時處理，工單描述如下",
				Classify:    noticeList,
				ProcessId:   workOrderValue.Process,
				Id:          workOrderInfo.Id,
				Title:       workOrderValue.Title,
				Creator:     userInfo.NickName,
				Priority:    workOrderValue.Priority,
				CreatedAt:   time.Now().Format("2006-01-02 15:04:05"),
			}
			err = bodyData.SendNotify()
			if err != nil {
				err = fmt.Errorf("通知發送失敗，%v", err.Error())
				return
			}
		}()
	}

	if workOrderValue.IsExecTask {
		// 執行任務
		err = json.Unmarshal(workOrderValue.Tasks, &taskList)
		if err != nil {
			return
		}
		if len(taskList) > 0 {
			paramsValue.Id = workOrderInfo.Id
			paramsValue.Title = workOrderInfo.Title
			paramsValue.Priority = workOrderInfo.Priority
			paramsValue.FormData = workOrderValue.Tpls["form_data"]
			var params []byte
			params, err = json.Marshal(paramsValue)
			if err != nil {
				return
			}

			go ExecTask(taskList, string(params))
		}
	}

	return
}
