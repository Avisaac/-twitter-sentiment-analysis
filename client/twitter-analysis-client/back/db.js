var mysql = require("mysql");
let type;
let value;
init = () => {
  return mysql.createConnection({
    host: "193.106.55.131",
    port: 3306,
    user: "projectuser",
    password: "Project#Final1",
    database: "project",
  });
}

del = (res) => {
  let connection = init();
  connection.connect();

  const query = "DELETE FROM tweets WHERE fullName = ''";
  connection.query(query, function(error, results) {
    if (error) throw error;
    res.send('deleted ' + results.affectedRows + ' rows');
  });

  connection.end();
};

silentDel = () => {
  let connection = init();
  connection.connect();

  const query = "DELETE FROM tweets WHERE fullName = ''";
  connection.query(query, function(error, results) {
    if (error) throw error;
    console.log('deleted ' + results.affectedRows + ' rows with silent delete');
  });

  connection.end();
};


rawData = (res) => {
  let connection = init();
  connection.connect();
  const query = "SELECT * FROM tweets";
  connection.query(query, function(error, results) {
    if (error) throw error;
    res.send({data: results});
  });
  connection.end();
}

allTweets = (res, t, v) => {
  let connection = init();
  connection.connect();
  type = t
  value = v

  if (type && value) {
    connection.query(`SELECT country, fullName, sum(isPositive) positive , count(*) - sum(isPositive) negative FROM tweets WHERE \`${type}\` = ? GROUP BY country, fullName`, [value],
      function(error, results) {
      if (error) throw error;
      res.send({data: aggregateData(results)});
    });
  } else {
    const query = "SELECT country, fullName, sum(isPositive) positive , count(*) - sum(isPositive) negative FROM tweets GROUP BY country, fullName";
    connection.query(query, function(error, results) {
      if (error) throw error;
      res.send({data: aggregateData(results)});
    });
  }

  connection.end();
};

allTweetsByDate = (res, t, v) => {
  let connection = init();
  connection.connect();
  type = t
  value = v

  let whereClause;
  switch (t) {
    case 'date-range':
      const dates = v.split('__')
      whereClause = `WHERE createdAt > '${dates[0]}' AND createdAt < '${dates[1]}'`
      break;
    case 'date-from':
      whereClause = `WHERE createdAt > '${v}'`
      break;
    case 'date-to':
      whereClause = `WHERE createdAt < '${v}'`
      break;
  
    default:
      break;
  }
  // console.log(whereClause)
  // console.log(`SELECT country, fullName, sum(isPositive) positive , count(*) - sum(isPositive) negative FROM tweets ${whereClause} GROUP BY country, fullName;`)
  connection.query(`SELECT country, fullName, sum(isPositive) positive , count(*) - sum(isPositive) negative FROM tweets ${whereClause} GROUP BY country, fullName;`,
  function(error, results) {
    if (error) console.log(error);
    // console.log(results)
    res.send({data: aggregateData(results)});
  });
  connection.end();
}

aggregateData = (data) => {
  let aggregated = {};
  data.forEach(el => {
    const currData = {
      city: el.fullName,
      positive: el.positive,
      negative: el.negative
    };
    aggregated[el.country] ? aggregated[el.country].push(currData) : aggregated[el.country] = [currData];
  });

  return aggregated;
}

module.exports = { init, allTweets, allTweetsByDate, rawData, silentDel, del };
