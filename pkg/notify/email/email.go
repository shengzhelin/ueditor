package email

/*
  @Author : lanyulei
  @Desc : 發送郵件
*/

import (
	"ferry/pkg/logger"
	"strconv"

	"github.com/spf13/viper"

	"gopkg.in/gomail.v2"
)

func server(mailTo []string, ccTo []string, subject, body string, args ...string) error {
	//定義信箱服務器連接訊息，如果是網易信箱 pass填密碼，qq信箱填授權碼
	mailConn := map[string]string{
		"user": viper.GetString("settings.email.user"),
		"pass": viper.GetString("settings.email.pass"),
		"host": viper.GetString("settings.email.host"),
		"port": viper.GetString("settings.email.port"),
	}

	port, _ := strconv.Atoi(mailConn["port"]) //轉換端口類型為int

	m := gomail.NewMessage()

	m.SetHeader("From", m.FormatAddress(mailConn["user"], viper.GetString("settings.email.alias"))) //這種方式可以添加別名，即“XX官方”
	m.SetHeader("To", mailTo...)                                                                    //發送給多個用戶
	m.SetHeader("Cc", ccTo...)                                                                      //發送給多個用戶
	m.SetHeader("Subject", subject)                                                                 //設置郵件主題
	m.SetBody("text/html", body)                                                                    //設置郵件正文

	d := gomail.NewDialer(mailConn["host"], port, mailConn["user"], mailConn["pass"])
	err := d.DialAndSend(m)
	return err

}

func SendMail(mailTo []string, ccTo []string, subject, body string) {
	err := server(mailTo, ccTo, subject, body)
	if err != nil {
		logger.Info(err)
		return
	}
	logger.Info("send successfully")
}
