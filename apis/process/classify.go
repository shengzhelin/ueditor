package process

import (
	"errors"
	"ferry/global/orm"
	process2 "ferry/models/process"
	"ferry/pkg/pagination"
	"ferry/tools"
	"ferry/tools/app"

	"github.com/gin-gonic/gin"
)

/*
  @Author : lanyulei
*/

// 創建流程分類
func CreateClassify(c *gin.Context) {
	var (
		err           error
		classifyValue process2.Classify
		classifyCount int
	)

	err = c.ShouldBind(&classifyValue)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	// 判斷創建的分類是否存在
	err = orm.Eloquent.Table("p_process_classify").
		Where("name = ?", classifyValue.Name).
		Where("`delete_time` IS NULL").
		Count(&classifyCount).Error
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	if classifyCount > 0 {
		app.Error(c, -1, errors.New("創建的分類名稱已經存在"), "")
		return
	}

	classifyValue.Creator = tools.GetUserId(c)

	err = orm.Eloquent.Table("p_process_classify").Create(&classifyValue).Error
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, "", "創建流程分類成功")
}

// 流程分類列表
func ClassifyList(c *gin.Context) {
	type classifyValue struct {
		process2.Classify
		CreateUser string `json:"create_user"`
		CreateName string `json:"create_name"`
	}

	var (
		err          error
		classifyList []*classifyValue
	)

	SearchParams := map[string]map[string]interface{}{
		"like": pagination.RequestParams(c),
	}

	db := orm.Eloquent.Model(&process2.Classify{}).Joins("left join sys_user on sys_user.user_id = p_process_classify.creator").
		Select("p_process_classify.*, sys_user.username as create_user, sys_user.nick_name as create_name").
		Where("p_process_classify.`delete_time` IS NULL")

	result, err := pagination.Paging(&pagination.Param{
		C:  c,
		DB: db,
	}, &classifyList, SearchParams, "p_process_classify")

	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	app.OK(c, result, "獲取分類列表成功")
}

// 更新流程分類
func UpdateClassify(c *gin.Context) {
	var (
		err           error
		classifyValue process2.Classify
	)

	err = c.ShouldBind(&classifyValue)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	// 更新
	err = orm.Eloquent.Model(&classifyValue).
		Where("id = ?", classifyValue.Id).
		Update("name", classifyValue.Name).Error
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, classifyValue, "流程分類更新成功")
}

// 刪除流程分類
func DeleteClassify(c *gin.Context) {
	classifyId := c.DefaultQuery("classifyId", "")
	if classifyId == "" {
		app.Error(c, -1, errors.New("參數傳遞失敗，請確認classifyId是否傳遞"), "")
		return
	}

	err := orm.Eloquent.Delete(process2.Classify{}, "id = ?", classifyId).Error
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, "", "流程分類刪除成功")
}
