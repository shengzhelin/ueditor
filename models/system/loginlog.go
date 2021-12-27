package system

import (
	"ferry/global/orm"
	"time"
)

/*
  @Author : lanyulei
*/

type LoginLog struct {
	InfoId        int       `json:"infoId" gorm:"primary_key;AUTO_INCREMENT"` //主鍵
	Username      string    `json:"username" gorm:"type:varchar(128);"`       //用戶名
	Status        string    `json:"status" gorm:"type:int(1);"`               //狀態
	Ipaddr        string    `json:"ipaddr" gorm:"type:varchar(255);"`         //ip地址
	LoginLocation string    `json:"loginLocation" gorm:"type:varchar(255);"`  //歸屬地
	Browser       string    `json:"browser" gorm:"type:varchar(255);"`        //瀏覽器
	Os            string    `json:"os" gorm:"type:varchar(255);"`             //系統
	Platform      string    `json:"platform" gorm:"type:varchar(255);"`       // 固件
	LoginTime     time.Time `json:"loginTime" gorm:"type:timestamp;"`         //登錄時間
	CreateBy      string    `json:"createBy" gorm:"type:varchar(128);"`       //創建人
	UpdateBy      string    `json:"updateBy" gorm:"type:varchar(128);"`       //更新者
	Params        string    `json:"params" gorm:"-"`                          //
	Remark        string    `json:"remark" gorm:"type:varchar(255);"`         //備注
	Msg           string    `json:"msg" gorm:"type:varchar(255);"`
	BaseModel
}

func (LoginLog) TableName() string {
	return "sys_loginlog"
}

func (e *LoginLog) Get() (LoginLog, error) {
	var doc LoginLog

	table := orm.Eloquent.Table(e.TableName())
	if e.Ipaddr != "" {
		table = table.Where("ipaddr = ?", e.Ipaddr)
	}
	if e.InfoId != 0 {
		table = table.Where("info_id = ?", e.InfoId)
	}

	if err := table.First(&doc).Error; err != nil {
		return doc, err
	}
	return doc, nil
}

func (e *LoginLog) GetPage(pageSize int, pageIndex int) ([]LoginLog, int, error) {
	var doc []LoginLog

	table := orm.Eloquent.Select("*").Table(e.TableName())
	if e.Ipaddr != "" {
		table = table.Where("ipaddr like ?", "%"+e.Ipaddr+"%")
	}
	if e.Status != "" {
		table = table.Where("status = ?", e.Status)
	}
	if e.Username != "" {
		table = table.Where("username like ?", "%"+e.Username+"%")
	}

	var count int

	if err := table.Order("info_id desc").Offset((pageIndex - 1) * pageSize).Limit(pageSize).Find(&doc).Error; err != nil {
		return nil, 0, err
	}
	table.Where("`delete_time` IS NULL").Count(&count)
	return doc, count, nil
}

func (e *LoginLog) Create() (LoginLog, error) {
	var doc LoginLog
	e.CreateBy = "0"
	e.UpdateBy = "0"
	result := orm.Eloquent.Table(e.TableName()).Create(&e)
	if result.Error != nil {
		err := result.Error
		return doc, err
	}
	doc = *e
	return doc, nil
}

func (e *LoginLog) Update(id int) (update LoginLog, err error) {

	if err = orm.Eloquent.Table(e.TableName()).First(&update, id).Error; err != nil {
		return
	}

	//參數1:是要修改的數據
	//參數2:是修改的數據
	if err = orm.Eloquent.Table(e.TableName()).Model(&update).Updates(&e).Error; err != nil {
		return
	}
	return
}

func (e *LoginLog) BatchDelete(id []int) (Result bool, err error) {
	if err = orm.Eloquent.Table(e.TableName()).Where("info_id in (?)", id).Delete(&LoginLog{}).Error; err != nil {
		return
	}
	Result = true
	return
}
