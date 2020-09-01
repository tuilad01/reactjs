const utilities = {}

utilities.getDayOfWeek = function (number) {
    switch (number) {
      case 0:
        return "Su";
      case 1:
        return "Mo";
      case 2:
        return "Tu";
      case 3:
        return "We";
      case 4:
        return "Th";
      case 5:
        return "Fr";
      case 6:
        return "Sa";
      default:
        return "Not in earth";
    }
  }

  utilities.toDate = function (dateNumber) {
    var date = new Date(dateNumber);
    return this.getDayOfWeek(date.getDay()) + ", " + date.toLocaleString();
  }

  utilities.getMin = function (time) {
    var now = Date.now();
    return (now - time) / 1000 / 60
  };

  utilities.getHour = function (time) {
    var now = Date.now();
    return (now - time) / 1000 / 60 / 60;
  }

  utilities.getDay = function (time) {
    var now = Date.now();
    return (now - time) / 1000 / 60 / 60 / 24
  };

  utilities.setColorRow = function (date) {
    if (typeof date !== 'number') return "";

    const minute = utilities.getMin(date);
    const hour = utilities.getHour(date);
    const day = utilities.getDay(date);
    if (minute < 5) {
      return "learn-recent";
    } else if (hour < 1) {
      return "learn-recent-1hour";
    } else if (day > 1) {
      return "learn-recent-1day";
    } else {
      return "";
    }
  }

  

export default utilities