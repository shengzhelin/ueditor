package tools

import (
	"ferry/pkg/logger"
	"strconv"

	"golang.org/x/crypto/bcrypt"
)

func StrToInt(err error, index string) int {
	result, err := strconv.Atoi(index)
	if err != nil {
		HasError(err, "string to int error"+err.Error(), -1)
	}
	return result
}

func CompareHashAndPassword(e string, p string) (bool, error) {
	err := bcrypt.CompareHashAndPassword([]byte(e), []byte(p))
	if err != nil {
		logger.Info(err.Error())
		return false, err
	}
	return true, nil
}

// Assert 條件斷言
// 當斷言條件為 假 時觸發 panic
// 對於當前請求不會再執行接下來的代碼，並且返回指定格式的錯誤信息和錯誤碼
func Assert(condition bool, msg string, code ...int) {
	if !condition {
		statusCode := 200
		if len(code) > 0 {
			statusCode = code[0]
		}
		panic("CustomError#" + strconv.Itoa(statusCode) + "#" + msg)
	}
}

// HasError 錯誤斷言
// 當 error 不為 nil 時觸發 panic
// 對於當前請求不會再執行接下來的代碼，並且返回指定格式的錯誤信息和錯誤碼
// 若 msg 為空，則默認為 error 中的內容
func HasError(err error, msg string, code ...int) {
	if err != nil {
		statusCode := 200
		if len(code) > 0 {
			statusCode = code[0]
		}
		if msg == "" {
			msg = err.Error()
		}
		logger.Info(err)
		panic("CustomError#" + strconv.Itoa(statusCode) + "#" + msg)
	}
}
