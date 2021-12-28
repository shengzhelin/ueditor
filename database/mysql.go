package database

import (
	"bytes"
	"ferry/global/orm"
	"ferry/pkg/logger"
	"ferry/tools/config"
	"strconv"

	"github.com/spf13/viper"

	_ "github.com/go-sql-driver/mysql" //加載mysql
	"github.com/jinzhu/gorm"
)

var (
	DbType   string
	Host     string
	Port     int
	Name     string
	Username string
	Password string
)

func (e *Mysql) Setup() {

	var err error
	var db Database

	db = new(Mysql)
	orm.MysqlConn = db.GetConnect()
	orm.Eloquent, err = db.Open(DbType, orm.MysqlConn)

	if err != nil {
		logger.Fatalf("%s connect error %v", DbType, err)
	} else {
		logger.Infof("%s connect success!", DbType)
	}

	if orm.Eloquent.Error != nil {
		logger.Fatalf("database error %v", orm.Eloquent.Error)
	}

	// 是否開啟詳細日誌記錄
	orm.Eloquent.LogMode(viper.GetBool("settings.gorm.logMode"))

	// 設置最大打開連接數
	orm.Eloquent.DB().SetMaxOpenConns(viper.GetInt("settings.gorm.maxOpenConn"))

	// 用於設置閒置的連接數.設置閒置的連接數則當開啟的一個連接使用完成後可以放在池裡等候下一次使用
	orm.Eloquent.DB().SetMaxIdleConns(viper.GetInt("settings.gorm.maxIdleConn"))
}

type Mysql struct {
}

func (e *Mysql) Open(dbType string, conn string) (db *gorm.DB, err error) {
	return gorm.Open(dbType, conn)
}

func (e *Mysql) GetConnect() string {

	DbType = config.DatabaseConfig.Dbtype
	Host = config.DatabaseConfig.Host
	Port = config.DatabaseConfig.Port
	Name = config.DatabaseConfig.Name
	Username = config.DatabaseConfig.Username
	Password = config.DatabaseConfig.Password

	var conn bytes.Buffer
	conn.WriteString(Username)
	conn.WriteString(":")
	conn.WriteString(Password)
	conn.WriteString("@tcp(")
	conn.WriteString(Host)
	conn.WriteString(":")
	conn.WriteString(strconv.Itoa(Port))
	conn.WriteString(")")
	conn.WriteString("/")
	conn.WriteString(Name)
	conn.WriteString("?charset=utf8&parseTime=True&loc=Local&timeout=10000ms")
	return conn.String()
}
