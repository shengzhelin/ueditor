package tools

type (
	Mode string
)

const (
	ModeDev  Mode = "dev"    //開發模式
	ModeTest Mode = "test"   //測試模式
	ModeProd Mode = "prod"   //生產模式
	Mysql         = "mysql"  //mysql數據庫標識
	Sqlite        = "sqlite" //sqlite
)
