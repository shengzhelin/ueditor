package process

import (
	"encoding/json"
	"ferry/models/base"
)

/*
  @Author : lanyulei
*/

// 工單
type WorkOrderInfo struct {
	base.Model
	Title         string          `gorm:"column:title; type:varchar(128)" json:"title" form:"title"`                                  // 工單標題
	Priority      int             `gorm:"column:priority; type:int(11)" json:"priority" form:"priority"`                              // 工單優先級 1，正常 2，緊急 3，非常緊急
	Process       int             `gorm:"column:process; type:int(11)" json:"process" form:"process"`                                 // 流程ID
	Classify      int             `gorm:"column:classify; type:int(11)" json:"classify" form:"classify"`                              // 分類ID
	IsEnd         int             `gorm:"column:is_end; type:int(11); default:0" json:"is_end" form:"is_end"`                         // 是否結束， 0 未結束，1 已結束
	IsDenied      int             `gorm:"column:is_denied; type:int(11); default:0" json:"is_denied" form:"is_denied"`                // 是否被拒絕， 0 沒有，1 有
	State         json.RawMessage `gorm:"column:state; type:json" json:"state" form:"state"`                                          // 狀態信息
	RelatedPerson json.RawMessage `gorm:"column:related_person; type:json" json:"related_person" form:"related_person"`               // 工單所有處理人
	Creator       int             `gorm:"column:creator; type:int(11)" json:"creator" form:"creator"`                                 // 創建人
	UrgeCount     int             `gorm:"column:urge_count; type:int(11); default:0" json:"urge_count" form:"urge_count"`             // 催辦次數
	UrgeLastTime  int             `gorm:"column:urge_last_time; type:int(11); default:0" json:"urge_last_time" form:"urge_last_time"` // 上一次催促時間
}

func (WorkOrderInfo) TableName() string {
	return "p_work_order_info"
}
