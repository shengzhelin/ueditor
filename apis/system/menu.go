package system

import (
	"ferry/models/system"
	"ferry/tools"
	"ferry/tools/app"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

/*
  @Author : lanyulei
*/

// @Summary Menu列表數據
// @Description 獲取JSON
// @Tags 選單
// @Param menuName query string false "menuName"
// @Success 200 {string} string "{"code": 200, "data": [...]}"
// @Success 200 {string} string "{"code": -1, "message": "抱歉未找到相關訊息"}"
// @Router /api/v1/menulist [get]
// @Security Bearer
func GetMenuList(c *gin.Context) {
	var (
		err    error
		Menu   system.Menu
		result []system.Menu
	)
	Menu.MenuName = c.Request.FormValue("menuName")
	Menu.Visible = c.Request.FormValue("visible")
	Menu.Title = c.Request.FormValue("title")

	if Menu.Title == "" {
		result, err = Menu.SetMenu()
	} else {
		result, err = Menu.GetPage()
	}
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}

	app.OK(c, result, "")
}

// @Summary Menu列表數據
// @Description 獲取JSON
// @Tags 選單
// @Param menuName query string false "menuName"
// @Success 200 {string} string "{"code": 200, "data": [...]}"
// @Success 200 {string} string "{"code": -1, "message": "抱歉未找到相關訊息"}"
// @Router /api/v1/menu [get]
// @Security Bearer
func GetMenu(c *gin.Context) {
	var data system.Menu
	id, _ := tools.StringToInt(c.Param("id"))
	data.MenuId = id
	result, err := data.GetByMenuId()
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	app.OK(c, result, "")
}

func GetMenuTreeRoleselect(c *gin.Context) {
	var Menu system.Menu
	var SysRole system.SysRole
	id, _ := tools.StringToInt(c.Param("roleId"))
	SysRole.RoleId = id
	result, err := Menu.SetMenuLable()
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	menuIds := make([]int, 0)
	if id != 0 {
		menuIds, err = SysRole.GetRoleMeunId()
		if err != nil {
			app.Error(c, -1, err, "")
			return
		}
	}
	app.Custum(c, gin.H{
		"code":        200,
		"menus":       result,
		"checkedKeys": menuIds,
	})
}

// @Summary 獲取選單樹
// @Description 獲取JSON
// @Tags 選單
// @Accept  application/x-www-form-urlencoded
// @Product application/x-www-form-urlencoded
// @Success 200 {string} string	"{"code": 200, "message": "添加成功"}"
// @Success 200 {string} string	"{"code": -1, "message": "添加失敗"}"
// @Router /api/v1/menuTreeselect [get]
// @Security Bearer
func GetMenuTreeelect(c *gin.Context) {
	var data system.Menu
	result, err := data.SetMenuLable()
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	app.OK(c, result, "")
}

// @Summary 創建選單
// @Description 獲取JSON
// @Tags 選單
// @Accept  application/x-www-form-urlencoded
// @Product application/x-www-form-urlencoded
// @Param menuName formData string true "menuName"
// @Param Path formData string false "Path"
// @Param Action formData string true "Action"
// @Param Permission formData string true "Permission"
// @Param ParentId formData string true "ParentId"
// @Param IsDel formData string true "IsDel"
// @Success 200 {string} string	"{"code": 200, "message": "添加成功"}"
// @Success 200 {string} string	"{"code": -1, "message": "添加失敗"}"
// @Router /api/v1/menu [post]
// @Security Bearer
func InsertMenu(c *gin.Context) {
	var data system.Menu
	err := c.BindWith(&data, binding.JSON)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	data.CreateBy = tools.GetUserIdStr(c)
	result, err := data.Create()
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	app.OK(c, result, "")
}

// @Summary 修改選單
// @Description 獲取JSON
// @Tags 選單
// @Accept  application/x-www-form-urlencoded
// @Product application/x-www-form-urlencoded
// @Param id path int true "id"
// @Param data body models.Menu true "body"
// @Success 200 {string} string	"{"code": 200, "message": "修改成功"}"
// @Success 200 {string} string	"{"code": -1, "message": "修改失敗"}"
// @Router /api/v1/menu/{id} [put]
// @Security Bearer
func UpdateMenu(c *gin.Context) {
	var data system.Menu
	err := c.BindWith(&data, binding.JSON)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	data.UpdateBy = tools.GetUserIdStr(c)
	_, err = data.Update(data.MenuId)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	app.OK(c, "", "修改成功")

}

// @Summary 刪除選單
// @Description 刪除數據
// @Tags 選單
// @Param id path int true "id"
// @Success 200 {string} string	"{"code": 200, "message": "刪除成功"}"
// @Success 200 {string} string	"{"code": -1, "message": "刪除失敗"}"
// @Router /api/v1/menu/{id} [delete]
func DeleteMenu(c *gin.Context) {
	var data system.Menu
	id, _ := tools.StringToInt(c.Param("id"))

	data.UpdateBy = tools.GetUserIdStr(c)
	_, err := data.Delete(id)
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	app.OK(c, "", "刪除成功")
}

// @Summary 根據角色名稱獲取選單列表數據（左選單使用）
// @Description 獲取JSON
// @Tags 選單
// @Param id path int true "id"
// @Success 200 {string} string "{"code": 200, "data": [...]}"
// @Success 200 {string} string "{"code": -1, "message": "抱歉未找到相關訊息"}"
// @Router /api/v1/menurole [get]
// @Security Bearer
func GetMenuRole(c *gin.Context) {
	var Menu system.Menu
	result, err := Menu.SetMenuRole(tools.GetRoleName(c))
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	app.OK(c, result, "")
}

// @Summary 獲取角色對應的選單id數組
// @Description 獲取JSON
// @Tags 選單
// @Param id path int true "id"
// @Success 200 {string} string "{"code": 200, "data": [...]}"
// @Success 200 {string} string "{"code": -1, "message": "抱歉未找到相關訊息"}"
// @Router /api/v1/menuids/{id} [get]
// @Security Bearer
func GetMenuIDS(c *gin.Context) {
	var data system.RoleMenu
	data.RoleName = c.GetString("role")
	data.UpdateBy = tools.GetUserIdStr(c)
	result, err := data.GetIDS()
	if err != nil {
		app.Error(c, -1, err, "")
		return
	}
	app.OK(c, result, "")
}
