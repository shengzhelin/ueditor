package service

import (
	"encoding/json"
	"errors"
	"ferry/global/orm"
	"ferry/models/process"
	"ferry/tools"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
)

/*
  @Author : lanyulei
*/

type WorkOrderData struct {
	process.WorkOrderInfo
	CurrentState string `json:"current_state"`
}

func ProcessStructure(c *gin.Context, processId int, workOrderId int) (result map[string]interface{}, err error) {
	var (
		processValue            process.Info
		processStructureDetails map[string]interface{}
		processNode             []map[string]interface{}
		tplDetails              []*process.TplInfo
		workOrderInfo           WorkOrderData
		workOrderTpls           []*process.TplData
		workOrderHistory        []*process.CirculationHistory
		stateList               []map[string]interface{}
	)

	err = orm.Eloquent.Model(&processValue).Where("id = ?", processId).Find(&processValue).Error
	//if err != nil {
	//	err = fmt.Errorf("查詢流程失敗，%v", err.Error())
	//	return
	//}

	if processValue.Structure != nil && len(processValue.Structure) > 0 {
		err = json.Unmarshal([]byte(processValue.Structure), &processStructureDetails)
		if err != nil {
			err = fmt.Errorf("json轉map失敗，%v", err.Error())
			return
		}

		// 排序，使用冒泡
		p := processStructureDetails["nodes"].([]interface{})
		if len(p) > 1 {
			for i := 0; i < len(p); i++ {
				for j := 1; j < len(p)-i; j++ {
					if p[j].(map[string]interface{})["sort"] == nil || p[j-1].(map[string]interface{})["sort"] == nil {
						return nil, errors.New("流程未定義順序屬性，請確認")
					}
					leftInt, _ := strconv.Atoi(p[j].(map[string]interface{})["sort"].(string))
					rightInt, _ := strconv.Atoi(p[j-1].(map[string]interface{})["sort"].(string))
					if leftInt < rightInt {
						//交換
						p[j], p[j-1] = p[j-1], p[j]
					}
				}
			}
			for _, node := range processStructureDetails["nodes"].([]interface{}) {
				processNode = append(processNode, node.(map[string]interface{}))
			}
		} else {
			processNode = processStructureDetails["nodes"].([]map[string]interface{})
		}
	}

	processValue.Structure = nil
	result = map[string]interface{}{
		"process": processValue,
		"nodes":   processNode,
		"edges":   processStructureDetails["edges"],
	}

	// 獲取歷史記錄
	err = orm.Eloquent.Model(&process.CirculationHistory{}).
		Where("work_order = ?", workOrderId).
		Order("id desc").
		Find(&workOrderHistory).Error
	if err != nil {
		return
	}
	result["circulationHistory"] = workOrderHistory

	if workOrderId == 0 {
		// 查詢流程模版
		var tplIdList []int
		err = json.Unmarshal(processValue.Tpls, &tplIdList)
		if err != nil {
			err = fmt.Errorf("json轉map失敗，%v", err.Error())
			return
		}
		err = orm.Eloquent.Model(&tplDetails).
			Where("id in (?)", tplIdList).
			Find(&tplDetails).Error
		if err != nil {
			err = fmt.Errorf("查詢模版失敗，%v", err.Error())
			return
		}
		result["tpls"] = tplDetails
	} else {
		// 查詢工單訊息
		err = orm.Eloquent.Model(&process.WorkOrderInfo{}).
			Where("id = ?", workOrderId).
			Scan(&workOrderInfo).Error
		if err != nil {
			return
		}
		// 獲取當前節點
		err = json.Unmarshal(workOrderInfo.State, &stateList)
		if err != nil {
			err = fmt.Errorf("序列化節點列表失敗，%v", err.Error())
			return
		}
		if len(stateList) == 0 {
			err = errors.New("當前工單沒有下一節點數據")
			return
		}

		// 整理需要並行處理的數據
		if len(stateList) > 1 {
		continueHistoryTag:
			for _, v := range workOrderHistory {
				status := false
				for i, s := range stateList {
					if v.Source == s["id"].(string) && v.Target != "" {
						status = true
						stateList = append(stateList[:i], stateList[i+1:]...)
						continue continueHistoryTag
					}
				}
				if !status {
					break
				}
			}
		}

		if len(stateList) > 0 {
		breakStateTag:
			for _, stateValue := range stateList {
				if processStructureDetails["nodes"] != nil {
					for _, processNodeValue := range processStructureDetails["nodes"].([]interface{}) {
						if stateValue["id"].(string) == processNodeValue.(map[string]interface{})["id"] {
							if _, ok := stateValue["processor"]; ok {
								for _, userId := range stateValue["processor"].([]interface{}) {
									if int(userId.(float64)) == tools.GetUserId(c) {
										workOrderInfo.CurrentState = stateValue["id"].(string)
										break breakStateTag
									}
								}
							} else {
								err = errors.New("未查詢到對應的處理人字段，請確認。")
								return
							}
						}
					}
				}
			}

			if workOrderInfo.CurrentState == "" {
				workOrderInfo.CurrentState = stateList[0]["id"].(string)
			}
		}

		result["workOrder"] = workOrderInfo

		// 查詢工單表單數據
		err = orm.Eloquent.Model(&workOrderTpls).
			Where("work_order = ?", workOrderId).
			Find(&workOrderTpls).Error
		if err != nil {
			return nil, err
		}
		result["tpls"] = workOrderTpls
	}
	return result, nil
}
