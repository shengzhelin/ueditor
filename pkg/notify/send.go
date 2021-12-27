package notify

import (
	"bytes"
	"ferry/models/system"
	"ferry/pkg/logger"
	"ferry/pkg/notify/email"
	"text/template"

	"github.com/spf13/viper"
)

/*
  @Author : lanyulei
  @同時發送多種通知方式
*/

type BodyData struct {
	SendTo        interface{} // 接受人
	EmailCcTo     []string    // 抄送人郵箱列表
	Subject       string      // 標題
	Classify      []int       // 通知類型
	Id            int         // 工單ID
	Title         string      // 工單標題
	Creator       string      // 工單創建人
	Priority      int         // 工單優先級
	PriorityValue string      // 工單優先級
	CreatedAt     string      // 工單創建時間
	Content       string      // 通知的內容
	Description   string      // 表格上面的描述信息
	ProcessId     int         // 流程ID
	Domain        string      // 域名地址
}

func (b *BodyData) ParsingTemplate() (err error) {
	// 讀取模版數據
	var (
		buf bytes.Buffer
	)

	tmpl, err := template.ParseFiles("./static/template/email.html")
	if err != nil {
		return
	}

	b.Domain = viper.GetString("settings.domain.url")
	err = tmpl.Execute(&buf, b)
	if err != nil {
		return
	}

	b.Content = buf.String()

	return
}

func (b *BodyData) SendNotify() (err error) {
	var (
		emailList []string
	)

	switch b.Priority {
	case 1:
		b.PriorityValue = "正常"
	case 2:
		b.PriorityValue = "緊急"
	case 3:
		b.PriorityValue = "非常緊急"
	}

	for _, c := range b.Classify {
		switch c {
		case 1: // 郵件
			users := b.SendTo.(map[string]interface{})["userList"].([]system.SysUser)
			if len(users) > 0 {
				for _, user := range users {
					emailList = append(emailList, user.Email)
				}
				err = b.ParsingTemplate()
				if err != nil {
					logger.Errorf("模版內容解析失敗，%v", err.Error())
					return
				}
				go email.SendMail(emailList, b.EmailCcTo, b.Subject, b.Content)
			}
		}
	}
	return
}
