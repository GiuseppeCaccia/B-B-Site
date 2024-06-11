function differenzaDate(date1,date2){
  let unGiornoMillis = 1000 * 60 * 60 * 24;  //in millisecondi
  let dateTimeParts1 = date1.split(/[- | /]/);
  let dateTimeParts2 = date2.split(/[- | /]/);
  dateTimeParts1[1]--;
  dateTimeParts2[1]--;
  let intoDate1 = new Date(...dateTimeParts1);
  let intoDate2 = new Date(...dateTimeParts2);
  let date1Millis = intoDate1.getTime();
  let date2Millis = intoDate2.getTime();
  return Math.round((date2Millis - date1Millis)/(unGiornoMillis));
}

exports.differenzaDate = differenzaDate;
