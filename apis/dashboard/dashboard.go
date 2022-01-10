package dashboard

import (
	"ferry/pkg/service"
	"ferry/tools/app"
	"fmt"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

/*
  @Author : lanyulei
*/

func InitData(c *gin.Context) {
	var (
		err       error
		count     map[string]int // 工單數量統計
		ranks     []service.Ranks
		submit    map[string][]interface{}
		startTime string
		endTime   string
		handle    interface{}
		period    interface{}
	)

	startTime = c.DefaultQuery("start_time", "")
	endTime = c.DefaultQuery("end_time", "")

	if startTime == "" || endTime == "" {
		// 默認為最近7天的數據
		startTime = fmt.Sprintf("%s 00:00:00", time.Now().AddDate(0, 0, -6).Format("2006-01-02"))
		endTime = fmt.Sprintf("%s 23:59:59", time.Now().Format("2006-01-02"))
	} else {
		if strings.Contains(startTime, "T") && strings.Contains(endTime, "T") {
			startTime = fmt.Sprintf("%s 00:00:00", strings.Split(startTime, "T")[0])
			endTime = fmt.Sprintf("%s 23:59:59", strings.Split(endTime, "T")[0])
		}
	}

	statistics := service.Statistics{
		StartTime: startTime,
		EndTime:   endTime,
	}

	// 查詢工單類型數據統計
	count, err = statistics.WorkOrderCount(c)
	if err != nil {
		app.Error(c, -1, err, "查詢工單類型數據統計失敗")
		return
	}

	// 查詢工單數據排名
	ranks, err = statistics.WorkOrderRanks()
	if err != nil {
		app.Error(c, -1, err, "查詢提交工單排名數據失敗")
		return
	}

	// 工單提交數據統計
	submit, err = statistics.DateRangeStatistics()
	if err != nil {
		app.Error(c, -1, err, "工單提交數據統計失敗")
		return
	}

	// 處理工單人員排行榜
	handle, err = statistics.HandlePersonRank()
	if err != nil {
		app.Error(c, -1, err, "查詢處理工單人員排行失敗")
		return
	}

	// 工單處理耗時排行榜
	period, err = statistics.HandlePeriodRank()
	if err != nil {
		app.Error(c, -1, err, "查詢工單處理耗時排行失敗")
		return
	}

	app.OK(c, map[string]interface{}{
		"count":  count,
		"ranks":  ranks,
		"submit": submit,
		"handle": handle,
		"period": period,
	}, "")
}
