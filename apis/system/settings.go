package system

import (
	"ferry/global/orm"
	"ferry/models/system"
	"ferry/tools/app"
	"fmt"

	"github.com/gin-gonic/gin"
)

/*
  @Author : lanyulei
*/

// 設置系統訊息
func GetSettingsInfo(c *gin.Context) {
	var (
		err          error
		settingsInfo []*system.Settings
		classify     string
	)
	db := orm.Eloquent.Model(&settingsInfo)
	classify = c.DefaultQuery("classify", "")
	if classify != "" {
		db = db.Where("classify = ?", classify)
	}

	err = db.Find(&settingsInfo).Error
	if err != nil {
		app.Error(c, -1, fmt.Errorf("查詢數據失敗，%v", err.Error()), "")
		return
	}

	app.OK(c, settingsInfo, "查詢配置訊息成功")
}

// 設置系統訊息
func SetSettingsInfo(c *gin.Context) {
	var (
		err           error
		settingsInfo  system.Settings
		settingsCount int
	)

	err = c.ShouldBind(&settingsInfo)
	if err != nil {
		app.Error(c, -1, fmt.Errorf("綁定數據失敗，%v", err.Error()), "")
		return
	}

	// 查詢數據是否存在
	err = orm.Eloquent.Model(&system.Settings{}).
		Where("classify = ?", settingsInfo.Classify).
		Count(&settingsCount).Error
	if err != nil {
		app.Error(c, -1, fmt.Errorf("查詢數據失敗，%v", err.Error()), "")
		return
	}
	if settingsCount == 0 {
		// 創建新的配置訊息
		err = orm.Eloquent.Create(&settingsInfo).Error
		if err != nil {
			app.Error(c, -1, fmt.Errorf("創建配置訊息失敗，%v", err.Error()), "")
			return
		}
	} else {
		err = orm.Eloquent.Model(&settingsInfo).
			Where("classify = ?", settingsInfo.Classify).
			Updates(&settingsInfo).Error
		if err != nil {
			app.Error(c, -1, fmt.Errorf("更新配置訊息失敗，%v", err.Error()), "")
			return
		}
	}

	app.OK(c, "", "配置訊息設置成功")
}
