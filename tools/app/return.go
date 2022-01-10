package app

import (
	"ferry/pkg/logger"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 失敗數據處理
func Error(c *gin.Context, code int, err error, msg string) {
	var res Response
	res.Msg = err.Error()
	if msg != "" {
		res.Msg = msg
	}
	logger.Error(res.Msg)
	c.JSON(http.StatusOK, res.ReturnError(code))
}

// 通常成功數據處理
func OK(c *gin.Context, data interface{}, msg string) {
	var res Response
	res.Data = data
	if msg != "" {
		res.Msg = msg
	}
	c.JSON(http.StatusOK, res.ReturnOK())
}

// 分頁數據處理
func PageOK(c *gin.Context, result interface{}, count int, pageIndex int, pageSize int, msg string) {
	var res PageResponse
	res.Data.List = result
	res.Data.Count = count
	res.Data.PageIndex = pageIndex
	res.Data.PageSize = pageSize
	if msg != "" {
		res.Msg = msg
	}
	c.JSON(http.StatusOK, res.ReturnOK())
}

// 兼容函數
func Custum(c *gin.Context, data gin.H) {
	c.JSON(http.StatusOK, data)
}
