package log

import (
	"ferry/global/orm"
	"ferry/models/system"
	"ferry/tools"
	"ferry/tools/app"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

// @Summary 登錄日志列表
// @Description 獲取JSON
// @Tags 登錄日志
// @Param status query string false "status"
// @Param dictCode query string false "dictCode"
// @Param dictType query string false "dictType"
// @Param pageSize query int false "頁條數"
// @Param pageIndex query int false "頁碼"
// @Success 200 {object} app.Response "{"code": 200, "data": [...]}"
// @Router /api/v1/loginloglist [get]
// @Security
func GetLoginLogList(c *gin.Context) {
	var (
		err       error
		pageSize  = 10
		pageIndex = 1
		data      system.LoginLog
	)

	size := c.Request.FormValue("pageSize")
	if size != "" {
		pageSize = tools.StrToInt(err, size)
	}

	index := c.Request.FormValue("pageIndex")
	if index != "" {
		pageIndex = tools.StrToInt(err, index)
	}

	data.Username = c.Request.FormValue("username")
	data.Status = c.Request.FormValue("status")
	data.Ipaddr = c.Request.FormValue("ipaddr")
	result, count, err := data.GetPage(pageSize, pageIndex)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	var mp = make(map[string]interface{}, 3)
	mp["list"] = result
	mp["count"] = count
	mp["pageIndex"] = pageIndex
	mp["pageSize"] = pageSize

	var res app.Response
	res.Data = mp
	c.JSON(http.StatusOK, res.ReturnOK())
}

// @Summary 通過編碼獲取登錄日志
// @Description 獲取JSON
// @Tags 登錄日志
// @Param infoId path int true "infoId"
// @Success 200 {object} app.Response "{"code": 200, "data": [...]}"
// @Router /api/v1/loginlog/{infoId} [get]
// @Security
func GetLoginLog(c *gin.Context) {
	var (
		res      app.Response
		LoginLog system.LoginLog
	)
	LoginLog.InfoId, _ = tools.StringToInt(c.Param("infoId"))
	result, err := LoginLog.Get()
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	res.Data = result
	c.JSON(http.StatusOK, res.ReturnOK())
}

// @Summary 添加登錄日志
// @Description 獲取JSON
// @Tags 登錄日志
// @Accept  application/json
// @Product application/json
// @Param data body models.LoginLog true "data"
// @Success 200 {string} string	"{"code": 200, "message": "添加成功"}"
// @Success 200 {string} string	"{"code": -1, "message": "添加失敗"}"
// @Router /api/v1/loginlog [post]
// @Security Bearer
func InsertLoginLog(c *gin.Context) {
	var data system.LoginLog
	err := c.BindWith(&data, binding.JSON)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	result, err := data.Create()
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	var res app.Response
	res.Data = result
	c.JSON(http.StatusOK, res.ReturnOK())
}

// @Summary 修改登錄日志
// @Description 獲取JSON
// @Tags 登錄日志
// @Accept  application/json
// @Product application/json
// @Param data body models.LoginLog true "body"
// @Success 200 {string} string	"{"code": 200, "message": "添加成功"}"
// @Success 200 {string} string	"{"code": -1, "message": "添加失敗"}"
// @Router /api/v1/loginlog [put]
// @Security Bearer
func UpdateLoginLog(c *gin.Context) {
	var (
		res  app.Response
		data system.LoginLog
	)
	err := c.BindWith(&data, binding.JSON)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	result, err := data.Update(data.InfoId)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	res.Data = result
	c.JSON(http.StatusOK, res.ReturnOK())
}

// @Summary 批量刪除登錄日志
// @Description 刪除數據
// @Tags 登錄日志
// @Param infoId path string true "以逗號（,）分割的infoId"
// @Success 200 {string} string	"{"code": 200, "message": "刪除成功"}"
// @Success 200 {string} string	"{"code": -1, "message": "刪除失敗"}"
// @Router /api/v1/loginlog/{infoId} [delete]
func DeleteLoginLog(c *gin.Context) {
	var (
		res  app.Response
		data system.LoginLog
	)
	data.UpdateBy = tools.GetUserIdStr(c)
	IDS := tools.IdsStrToIdsIntGroup("infoId", c)
	_, err := data.BatchDelete(IDS)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	res.Msg = "刪除成功"
	c.JSON(http.StatusOK, res.ReturnOK())
}

func CleanLoginLog(c *gin.Context) {

	err := orm.Eloquent.Delete(&system.LoginLog{}).Error
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, "", "已清空")
}
