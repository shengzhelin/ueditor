package controllers

import (
	"github.com/astaxie/beego"
	"github.com/canghai908/zbxtable/models"
)

//IndexController 首頁數據獲取
type IndexController struct {
	beego.Controller
}

//InfoRes resp
var InfoRes models.InfoRes

//URLMapping beego
func (c *IndexController) URLMapping() {
	c.Mapping("Get", c.GetInfo)
}

// GetInfo ...
// @Title 首頁數據
// @Description 基本訊息獲取
// @Param	X-Token		header  string			true		"x-token in header"
// @Success 200 {object} models.Manager
// @Failure 403 :id is empty
// @router / [get]
func (c *IndexController) GetInfo() {
	info, err := models.GetCountHost()
	if err != nil {
		InfoRes.Code = 500
		InfoRes.Message = err.Error()
	} else {
		InfoRes.Code = 200
		InfoRes.Message = "獲取成功"
		InfoRes.Data.Items = info
	}
	c.Data["json"] = InfoRes
	c.ServeJSON()
}
