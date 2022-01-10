package models

import (
	"math"
	"strconv"
	"strings"
)

//HostsList func
func HostsList(page, limit, hosts string) ([]Hosts, int64, error) {
	//獲取主機列表
	par := []string{"templateid", "name"}
	rep, err := API.Call("host.get", Params{"selectParentTemplates": par, "selectGroups": "extend", "selectInterfaces": "extend"})
	if err != nil {
		return []Hosts{}, 0, err
	}
	hba, err := json.Marshal(rep.Result)
	if err != nil {
		return []Hosts{}, 0, err
	}
	var hb ListHosts

	err = json.Unmarshal(hba, &hb)
	if err != nil {
		return []Hosts{}, 0, err
	}
	var dt []Hosts
	var d Hosts
	if hosts != "" {
		// var dt []Hosts
		// var d Hosts
		for _, v := range hb {
			if strings.Contains(v.Name, hosts) {
				d.HostID = v.Hostid
				d.Host = v.Host
				d.Name = v.Name
				d.Interfaces = v.Interfaces[0].IP + ":" + v.Interfaces[0].Port
				d.Groups = v.Groups[0].Name
				d.Status = v.Status
				d.Available = v.Available
				d.Error = v.Error
				ml := len(v.ParentTemplates)
				dm := make([]string, ml)
				for kk, vv := range v.ParentTemplates {
					dm[kk] = vv.Name
				}
				d.Template = dm
				dt = append(dt, d)
			}
		}
	} else {
		for _, v := range hb {
			d.HostID = v.Hostid
			d.Host = v.Host
			d.Name = v.Name
			d.Interfaces = v.Interfaces[0].IP + ":" + v.Interfaces[0].Port
			d.Groups = v.Groups[0].Name
			d.Status = v.Status
			d.Available = v.Available
			d.Error = v.Error
			ml := len(v.ParentTemplates)
			dm := make([]string, ml)
			for kk, vv := range v.ParentTemplates {
				dm[kk] = vv.Name
			}
			d.Template = dm
			dt = append(dt, d)
		}
	}
	IntPage, err := strconv.Atoi(page)
	if err != nil {
		IntPage = 1
	}
	IntLimit, err := strconv.Atoi(limit)
	if err != nil {
		IntLimit = 10
	}
	//如果dt為空直接返回
	if len(dt) == 0 {
		return dt, int64(len(dt)), err
	}
	//分頁
	nums := len(dt)

	//end int
	//page總數
	totalpages := int(math.Ceil(float64(nums) / float64(IntLimit)))
	if IntPage >= totalpages {
		IntPage = totalpages
	}
	if IntPage <= 0 {
		IntPage = 1
	}
	//結束頁數據
	var end int
	//begin 開始頁數據

	begin := (IntPage - 1) * IntLimit
	if IntPage == totalpages {
		end = nums
	}
	if IntPage < totalpages {
		end = IntPage * IntLimit
	} else {
		end = nums
	}
	//根據開始和結束返回數據列表
	var newthostlist []Hosts
	for i := begin; i < end; i++ {
		newthostlist = append(newthostlist, dt[i])
	}
	return newthostlist, int64(len(dt)), err

}
