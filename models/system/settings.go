package system

import (
	"encoding/json"
	"ferry/models/base"
)

/*
  @Author : lanyulei
*/

// 配置信息
type Settings struct {
	base.Model
	Classify int             `gorm:"column:classify; type:int(11)" json:"classify" form:"classify"` // 設置分類，1 配置信息，2 Ldap配置
	Content  json.RawMessage `gorm:"column:content; type:json" json:"content" form:"content"`       // 配置內容
}

func (Settings) TableName() string {
	return "sys_settings"
}
