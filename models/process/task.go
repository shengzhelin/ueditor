package process

import (
	"ferry/models/base"
)

/*
  @Author : lanyulei
*/

// 任務
type TaskInfo struct {
	base.Model
	Name     string `gorm:"column:name; type: varchar(256)" json:"name" form:"name"`               // 任務名稱
	TaskType string `gorm:"column:task_type; type: varchar(45)" json:"task_type" form:"task_type"` // 任務類型
	Content  string `gorm:"column:content; type: longtext" json:"content" form:"content"`          // 任務內容
	Creator  int    `gorm:"column:creator; type: int(11)" json:"creator" form:"creator"`           // 創建者
	Remarks  string `gorm:"column:remarks; type: longtext" json:"remarks" form:"remarks"`          // 備注
}

func (TaskInfo) TableName() string {
	return "p_task_info"
}
