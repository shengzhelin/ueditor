package middleware

import (
	mycasbin "ferry/pkg/casbin"
	"ferry/pkg/jwtauth"
	_ "ferry/pkg/jwtauth"
	"ferry/pkg/logger"
	"ferry/tools"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

//權限檢查中間件
func AuthCheckRole() gin.HandlerFunc {
	return func(c *gin.Context) {
		data, _ := c.Get("JWT_PAYLOAD")
		v := data.(jwtauth.MapClaims)
		e, err := mycasbin.Casbin()
		tools.HasError(err, "", 500)
		//檢查權限
		res, err := e.Enforce(v["rolekey"], c.Request.URL.Path, c.Request.Method)
		logger.Info(v["rolekey"], c.Request.URL.Path, c.Request.Method)
		tools.HasError(err, "", 500)

		if res {
			c.Next()
		} else {
			c.JSON(http.StatusOK, gin.H{
				"code": 403,
				"msg":  fmt.Sprintf("對不起，您沒有 <%v-%v> 訪問權限，請聯系管理員", c.Request.URL.Path, c.Request.Method),
			})
			c.Abort()
			return
		}
	}
}
