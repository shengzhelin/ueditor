package service

import (
	"strconv"
)

/*
  @Author : lanyulei
  @Desc : 獲取節點數據
*/

type ProcessState struct {
	Structure map[string][]map[string]interface{}
}

// 獲取節點信息
func (p *ProcessState) GetNode(stateId string) (nodeValue map[string]interface{}, err error) {
	for _, node := range p.Structure["nodes"] {
		if node["id"] == stateId {
			nodeValue = node
		}
	}
	return
}

// 獲取流轉信息
func (p *ProcessState) GetEdge(stateId string, classify string) (edgeValue []map[string]interface{}, err error) {
	var (
		leftSort  int
		rightSort int
	)

	for _, edge := range p.Structure["edges"] {
		if edge[classify] == stateId {
			edgeValue = append(edgeValue, edge)
		}
	}

	// 排序
	if len(edgeValue) > 1 {
		for i := 0; i < len(edgeValue)-1; i++ {
			for j := i + 1; j < len(edgeValue); j++ {
				if t, ok := edgeValue[i]["sort"]; ok {
					leftSort, _ = strconv.Atoi(t.(string))
				}
				if t, ok := edgeValue[j]["sort"]; ok {
					rightSort, _ = strconv.Atoi(t.(string))
				}
				if leftSort > rightSort {
					edgeValue[j], edgeValue[i] = edgeValue[i], edgeValue[j]
				}
			}
		}
	}

	return
}
