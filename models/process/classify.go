package process

import (
	"ferry/models/base"
)

/*
  @Author : lanyulei
*/

// 流程分類
type Classify struct {
	base.Model
	Name    string `gorm:"column:name; type: varchar(128)" json:"name" form:"name"`     // 分類名稱
	Creator int    `gorm:"column:creator; type: int(11)" json:"creator" form:"creator"` // 創建者
}

func (Classify) TableName() string {
	return "p_process_classify"
}
