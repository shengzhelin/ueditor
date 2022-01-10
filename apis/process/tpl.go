package process

import (
	"errors"
	"ferry/global/orm"
	"ferry/models/process"
	"ferry/pkg/pagination"
	"ferry/tools"
	"ferry/tools/app"

	"github.com/gin-gonic/gin"
)

/*
 @Author : lanyulei
*/

// 模板列表
func TemplateList(c *gin.Context) {
	var (
		err          error
		templateList []*struct {
			process.TplInfo
			CreateUser string `json:"create_user"`
			CreateName string `json:"create_name"`
		}
	)

	SearchParams := map[string]map[string]interface{}{
		"like": pagination.RequestParams(c),
	}

	db := orm.Eloquent.Model(&process.TplInfo{}).Joins("left join sys_user on sys_user.user_id = p_tpl_info.creator").
		Select("p_tpl_info.id, p_tpl_info.create_time, p_tpl_info.update_time, p_tpl_info.`name`, p_tpl_info.`creator`, sys_user.username as create_user, sys_user.nick_name as create_name")

	result, err := pagination.Paging(&pagination.Param{
		C:  c,
		DB: db,
	}, &templateList, SearchParams, "p_tpl_info")

	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, result, "獲取模版列表成功")
}

// 創建模版
func CreateTemplate(c *gin.Context) {
	var (
		err           error
		templateValue process.TplInfo
		templateCount int
	)

	err = c.ShouldBind(&templateValue)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	// 確認模版名稱是否存在
	err = orm.Eloquent.Model(&templateValue).
		Where("name = ?", templateValue.Name).
		Count(&templateCount).Error
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	if templateCount > 0 {
		app.Error(c, -1, errors.New("模版名稱已存在"), "")
		return
	}

	templateValue.Creator = tools.GetUserId(c) // 當前登入用戶ID
	err = orm.Eloquent.Create(&templateValue).Error
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, "", "創建模版成功")
}

// 模版詳情
func TemplateDetails(c *gin.Context) {
	var (
		err                  error
		templateDetailsValue process.TplInfo
	)

	templateId := c.DefaultQuery("template_id", "")
	if templateId == "" {
		app.Error(c, -1, err, "")
		return
	}

	err = orm.Eloquent.Model(&templateDetailsValue).
		Where("id = ?", templateId).
		Find(&templateDetailsValue).Error
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, templateDetailsValue, "")
}

// 更新模版
func UpdateTemplate(c *gin.Context) {
	var (
		err           error
		templateValue process.TplInfo
	)
	err = c.ShouldBind(&templateValue)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	err = orm.Eloquent.Model(&templateValue).
		Where("id = ?", templateValue.Id).
		Updates(map[string]interface{}{
			"name":           templateValue.Name,
			"remarks":        templateValue.Remarks,
			"form_structure": templateValue.FormStructure,
		}).Error
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, templateValue, "")
}

// 刪除模版
func DeleteTemplate(c *gin.Context) {
	var (
		err error
	)

	templateId := c.DefaultQuery("templateId", "")
	if templateId == "" {
		app.Error(c, -1, errors.New("參數不正確，請確認templateId是否傳遞"), "")
		return
	}

	err = orm.Eloquent.Delete(process.TplInfo{}, "id = ?", templateId).Error
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, "", "刪除模版成功")
}

// 複製模版
func CloneTemplate(c *gin.Context) {
	var (
		err  error
		id   string
		info process.TplInfo
	)

	id = c.Param("id")

	err = orm.Eloquent.Find(&info, id).Error
	if err != nil {
		app.Error(c, -1, err, "查詢模版數據失敗")
		return
	}

	err = orm.Eloquent.Create(&process.TplInfo{
		Name:          info.Name + "-copy",
		FormStructure: info.FormStructure,
		Creator:       tools.GetUserId(c),
		Remarks:       info.Remarks,
	}).Error
	if err != nil {
		app.Error(c, -1, err, "複製模版失敗")
		return
	}

	app.OK(c, nil, "")
}
