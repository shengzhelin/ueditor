package ldap

import (
	"crypto/tls"
	"errors"
	"ferry/pkg/logger"
	"fmt"
	"time"

	"github.com/spf13/viper"

	"github.com/go-ldap/ldap/v3"
)

/*
  @Author : lanyulei
*/

var conn *ldap.Conn

// ldap連接
func ldapConnection() (err error) {
	var ldapConn = fmt.Sprintf("%v:%v", viper.GetString("settings.ldap.host"), viper.GetString("settings.ldap.port"))

	if viper.GetBool("settings.ldap.tls") {
		tlsConf := &tls.Config{
			InsecureSkipVerify: true,
		}
		conn, err = ldap.DialTLS("tcp", ldapConn, tlsConf)
	} else {
		conn, err = ldap.Dial("tcp", ldapConn)
	}
	if err != nil {
		err = errors.New(fmt.Sprintf("無法連接到ldap服務器，%v", err))
		logger.Error(err)
		return
	}

	//設置超時時間
	conn.SetTimeout(5 * time.Second)

	return
}
