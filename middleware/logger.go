package middleware

import (
	"ferry/pkg/logger"
	"time"

	"github.com/gin-gonic/gin"
)

// 日誌記錄到文件
func LoggerToFile() gin.HandlerFunc {

	return func(c *gin.Context) {
		// 開始時間
		startTime := time.Now()

		// 處理請求
		c.Next()

		// 結束時間
		endTime := time.Now()

		// 執行時間
		latencyTime := endTime.Sub(startTime)

		// 請求方式
		reqMethod := c.Request.Method

		// 請求路由
		reqUri := c.Request.RequestURI

		// 狀態碼
		statusCode := c.Writer.Status()

		// 請求IP
		clientIP := c.ClientIP()

		// 日誌格式
		logger.Infof(" %s %3d %13v %15s %s %s",
			startTime.Format("2006-01-02 15:04:05.9999"),
			statusCode,
			latencyTime,
			clientIP,
			reqMethod,
			reqUri,
		)
	}
}
