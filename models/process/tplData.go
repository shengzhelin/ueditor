package process

import (
	"encoding/json"
	"ferry/models/base"
)

/*
  @Author : lanyulei
*/

// 工單綁定模版數據
type TplData struct {
	base.Model
	WorkOrder     int             `gorm:"column:work_order; type: int(11)" json:"work_order" form:"work_order"`          // 工單ID
	FormStructure json.RawMessage `gorm:"column:form_structure; type: json" json:"form_structure" form:"form_structure"` // 表單結構
	FormData      json.RawMessage `gorm:"column:form_data; type: json" json:"form_data" form:"form_data"`                // 表單數據
}

func (TplData) TableName() string {
	return "p_work_order_tpl_data"
}
