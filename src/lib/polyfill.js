// ===== 정수인지 확인.
/*
  실수, 무한 등을 확인할 때 유용한다.
*/
Number.isInteger =
  Number.isInteger ||
  function(value) {
    return (
      typeof value === "number" &&
      isFinite(value) &&
      Math.floor(value) === value
    );
  };

// eslint-disable-next-line no-extend-native
Date.prototype.format = function(f) {
  if (!this.valueOf()) return " ";

  var weekName = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일"
  ];
  var d = this;

  return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
    switch ($1) {
      case "yyyy":
        return d.getFullYear();
      case "yy":
        return (d.getFullYear() % 1000).zf(2);
      case "MM":
        return (d.getMonth() + 1).zf(2);
      case "dd":
        return d.getDate().zf(2);
      case "E":
        return weekName[d.getDay()];
      case "HH":
        return d.getHours().zf(2);
      case "hh":
        var h = d.getHours() % 12;
        h = h ? h : 12;
        return h.zf(2);
      case "mm":
        return d.getMinutes().zf(2);
      case "ss":
        return d.getSeconds().zf(2);
      case "a/p":
        return d.getHours() < 12 ? "오전" : "오후";
      default:
        return $1;
    }
  });
};

// eslint-disable-next-line no-extend-native
String.prototype.string = function(len) {
  var s = "",
    i = 0;
  while (i++ < len) {
    s += this;
  }
  return s;
};
String.prototype.zf = function(len) {
  return "0".string(len - this.length) + this;
};
Number.prototype.zf = function(len) {
  return this.toString().zf(len);
};
/*=========================================================
  * dateform
  =========================================================*/

// eslint-disable-next-line no-extend-native
Date.prototype.calculation = function(date, num) {
  if (date === "date") {
    this.setDate(this.getDate() + num);
  } else if (date === "month") {
    this.setMonth(this.getMonth() + num);
  } else if (date === "year") {
    this.setYear(this.getFullYear() + num);
  }
  return this;
};
/*=========================================================
  * 날짜 계산
  * ex)
  * 	console.log(new Date().caculation('date', -5).format('yyyy-MM-dd'));
  =========================================================*/
