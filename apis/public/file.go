package public

import (
	"encoding/base64"
	"errors"
	"ferry/tools/app"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/spf13/viper"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// @Summary 上傳圖片
// @Description 獲取JSON
// @Tags 公共接口
// @Accept multipart/form-data
// @Param type query string true "type" (1：單圖，2：多圖, 3：base64圖片)
// @Param file formData file true "file"
// @Success 200 {string} string	"{"code": 200, "message": "添加成功"}"
// @Success 200 {string} string	"{"code": -1, "message": "添加失敗"}"
// @Router /api/v1/public/uploadFile [post]

func UploadFile(c *gin.Context) {
	var (
		urlPrefix    string
		tag          string
		fileType     string
		saveFilePath string
		err          error
		protocol     string = "http"
		requestHost  string
	)
	tag, _ = c.GetPostForm("type")
	fileType = c.DefaultQuery("file_type", "images")

	if fileType != "images" && fileType != "files" {
		app.Error(c, -1, fmt.Errorf("上傳接口目前，僅支持圖片上傳和文件上傳"), "")
		return
	}

	if strings.HasPrefix(c.Request.Header.Get("Origin"), "https") {
		protocol = "https"
	}

	requestHostList := strings.Split(c.Request.Host, ":")
	if len(requestHostList) > 1 && requestHostList[1] == "80" {
		requestHost = requestHostList[0]
	} else {
		requestHost = c.Request.Host
	}

	if viper.GetBool("settings.domain.getHost") {
		urlPrefix = fmt.Sprintf("%s://%s/", protocol, requestHost)
	} else {
		urlPrefix = fmt.Sprintf("%s://%s", protocol, viper.GetString("settings.domain.url"))
		if !strings.HasSuffix(viper.GetString("settings.domain.url"), "/") {
			urlPrefix = urlPrefix + "/"
		}
	}

	if tag == "" {
		tag = "1"
	}

	saveFilePath = "static/uploadfile/" + fileType + "/"
	_, err = os.Stat(saveFilePath)
	if os.IsNotExist(err) {
		err = os.MkdirAll(saveFilePath, 0755)
		if err != nil {
			app.Error(c, -1, err, fmt.Sprintf("創建圖片目錄失敗，%v", err.Error()))
			return
		}
	}

	guid := strings.ReplaceAll(uuid.New().String(), "-", "")

	switch tag {
	case "1": // 單圖
		files, err := c.FormFile("file")
		if err != nil {
			app.Error(c, 200, errors.New(""), "圖片不能為空")
			return
		}
		// 上傳文件至指定目錄
		singleFile := saveFilePath + guid + "-" + files.Filename
		_ = c.SaveUploadedFile(files, singleFile)
		app.OK(c, urlPrefix+singleFile, "上傳成功")
		return
	case "2": // 多圖
		files := c.Request.MultipartForm.File["file"]
		multipartFile := make([]string, len(files))
		for _, f := range files {
			guid = strings.ReplaceAll(uuid.New().String(), "-", "")
			multipartFileName := saveFilePath + guid + "-" + f.Filename
			_ = c.SaveUploadedFile(f, multipartFileName)
			multipartFile = append(multipartFile, urlPrefix+multipartFileName)
		}
		app.OK(c, multipartFile, "上傳成功")
		return
	case "3": // base64
		files, _ := c.GetPostForm("file")
		ddd, _ := base64.StdEncoding.DecodeString(files)
		_ = ioutil.WriteFile(saveFilePath+guid+".jpg", ddd, 0666)
		app.OK(c, urlPrefix+saveFilePath+guid+".jpg", "上傳成功")
	default:
		app.Error(c, 200, errors.New(""), "標識不正確")
		return
	}
}
