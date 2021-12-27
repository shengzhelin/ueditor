package service

import (
	"errors"
	"ferry/global/orm"
	"ferry/models/system"
	"reflect"
	"strings"
)

/*
  @Author : lanyulei
  @todo: 添加新的處理人時候，需要修改（先完善功能，後續有時間的時候優化一下這部分。）
*/

func GetPrincipal(processor []int, processMethod string) (principals string, err error) {
	/*
		person 人員
		persongroup 人員組
		department 部門
		variable 變量
	*/
	var principalList []string
	switch processMethod {
	case "person":
		err = orm.Eloquent.Model(&system.SysUser{}).
			Where("user_id in (?)", processor).
			Pluck("nick_name", &principalList).Error
		if err != nil {
			return
		}
	case "role":
		err = orm.Eloquent.Model(&system.SysRole{}).
			Where("role_id in (?)", processor).
			Pluck("role_name", &principalList).Error
		if err != nil {
			return
		}
	case "department":
		err = orm.Eloquent.Model(&system.Dept{}).
			Where("dept_id in (?)", processor).
			Pluck("dept_name", &principalList).Error
		if err != nil {
			return
		}
	case "variable":
		for _, p := range processor {
			switch p {
			case 1:
				principalList = append(principalList, "創建者")
			case 2:
				principalList = append(principalList, "創建者負責人")
			}
		}
	}
	return strings.Join(principalList, ","), nil
}

// 獲取用戶對應
func GetPrincipalUserInfo(stateList []interface{}, creator int) (userInfoList []system.SysUser, err error) {
	var (
		userInfo        system.SysUser
		deptInfo        system.Dept
		userInfoListTmp []system.SysUser // 臨時保存查詢的列表數據
		processorList   []interface{}
	)

	err = orm.Eloquent.Model(&userInfo).Where("user_id = ?", creator).Find(&userInfo).Error
	if err != nil {
		return
	}

	for _, stateItem := range stateList {

		if reflect.TypeOf(stateItem.(map[string]interface{})["processor"]) == nil {
			err = errors.New("未找到對應的處理人，請確認。")
			return
		}
		stateItemType := reflect.TypeOf(stateItem.(map[string]interface{})["processor"]).String()
		if stateItemType == "[]int" {
			for _, v := range stateItem.(map[string]interface{})["processor"].([]int) {
				processorList = append(processorList, v)
			}
		} else {
			processorList = stateItem.(map[string]interface{})["processor"].([]interface{})
		}

		switch stateItem.(map[string]interface{})["process_method"] {
		case "person":
			err = orm.Eloquent.Model(&system.SysUser{}).
				Where("user_id in (?)", processorList).
				Find(&userInfoListTmp).Error
			if err != nil {
				return
			}
			userInfoList = append(userInfoList, userInfoListTmp...)
		case "role":
			err = orm.Eloquent.Model(&system.SysUser{}).
				Where("role_id in (?)", processorList).
				Find(&userInfoListTmp).Error
			if err != nil {
				return
			}
			userInfoList = append(userInfoList, userInfoListTmp...)
		case "department":
			err = orm.Eloquent.Model(&system.SysUser{}).
				Where("dept_id in (?)", processorList).
				Find(&userInfoListTmp).Error
			if err != nil {
				return
			}
			userInfoList = append(userInfoList, userInfoListTmp...)
		case "variable": // 變量
			for _, processor := range processorList {
				if int(processor.(float64)) == 1 {
					// 創建者
					userInfoList = append(userInfoList, userInfo)
				} else if int(processor.(float64)) == 2 {
					// 1. 查詢部門信息
					err = orm.Eloquent.Model(&deptInfo).Where("dept_id = ?", userInfo.DeptId).Find(&deptInfo).Error
					if err != nil {
						return
					}

					// 2. 查詢Leader信息
					err = orm.Eloquent.Model(&userInfo).Where("user_id = ?", deptInfo.Leader).Find(&userInfo).Error
					if err != nil {
						return
					}
					userInfoList = append(userInfoList, userInfo)
				}
			}
		}
	}

	return
}
