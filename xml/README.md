# Data Export

## SQL Connection / Queries
Server: bw1-sql-hs2020.database.windows.net
Database: bw1-hs2020-data_step_analysis

### Get iPhone LivingData - Steps
```select l.pid, source, unit, value, startdate AS startDate, endtime AS endDate from dbo.livingdata as l
join dbo.participants as p on p.pid=l.pid
where p.fulltime = '0' and l.typeid = '1' order by l.pid, l.startdate;
```

## XML Export
Azure Data Studio -> Export as XML

## bash script
chmod a+x xml_create.sh
./xml_create.sh <xml_export_file>

## Upload <pid>.xml files
git add <pid>.xml
git commit -m "add new xml file/s"
git push 

