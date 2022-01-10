// +build packfile

package packfile

import (
	"github.com/astaxie/beego/logs"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

//go:generate go-bindata -o=staticFile.go -pkg=packfile -tags=packfile  ../web/... ../nginx.conf ../control ../msty.ttf

func writeFile(path string, data []byte) {
	// 如果文件夾不存在，預先創建文件夾
	if lastSeparator := strings.LastIndex(path, "/"); lastSeparator != -1 {
		dirPath := path[:lastSeparator]
		if _, err := os.Stat(dirPath); err != nil && os.IsNotExist(err) {
			os.MkdirAll(dirPath, os.ModePerm)
		}
	}

	// 已存在的文件，不應該覆蓋重寫，可能在前端更改了配置文件等
	if _, err := os.Stat(path); os.IsNotExist(err) {
		if err2 := ioutil.WriteFile(path, data, os.ModePerm); err2 != nil {
			logs.Error("Write file failed: %s\n", path)
		}
	}
}

func init() {
	for key := range _bindata {
		filePath, _ := filepath.Abs(strings.TrimPrefix(key, "."))
		data, err := Asset(key)
		if err == nil {
			writeFile(filePath, data)
		}
	}
}
