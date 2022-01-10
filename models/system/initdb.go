package system

import (
	"ferry/global/orm"
	config2 "ferry/tools/config"
	"fmt"
	"io/ioutil"
	"strings"
)

/*
  @Author : lanyulei
*/

func InitDb() error {
	filePath := "config/db.sql"
	if config2.DatabaseConfig.Dbtype == "sqlite3" {
		fmt.Println("sqlite3數據庫無需初始化！")
		return nil
	}
	sql, err := Ioutil(filePath)
	if err != nil {
		fmt.Println("數據庫基礎數據初始化腳本讀取失敗！原因:", err.Error())
		return err
	}
	sqlList := strings.Split(sql, ";")
	for _, sql := range sqlList {
		if strings.Contains(sql, "--") {
			fmt.Println(sql)
			continue
		}
		sqlValue := strings.Replace(sql+";", "\n", "", 1)
		if err = orm.Eloquent.Exec(sqlValue).Error; err != nil {
			if !strings.Contains(err.Error(), "Query was empty") {
				return err
			}
		}
	}
	return nil
}

func Ioutil(name string) (string, error) {
	if contents, err := ioutil.ReadFile(name); err == nil {
		//因為contents是[]byte類型，直接轉換成string類型後會多一行空格,需要使用strings.Replace替換換行符
		result := strings.Replace(string(contents), "\n", "", 1)
		return result, nil
	} else {
		return "", err
	}
}
