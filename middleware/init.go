package middleware

import (
	"github.com/gin-gonic/gin"

)


func InitMiddleware(r *gin.Engine) {
	// 日志處理
	r.Use(LoggerToFile())
	// 自定義錯誤處理
	r.Use(CustomError)
	// NoCache is a middleware function that appends headers
	r.Use(NoCache)
	// 跨域處理
	r.Use(Options)
	// Secure is a middleware function that appends security
	r.Use(Secure)
	// Set X-Request-Id header
	r.Use(RequestId())
}