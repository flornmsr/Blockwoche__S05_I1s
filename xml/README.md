# Data Export

## SQL Connection / Queries
Server: bw1-sql-hs2020.database.windows.net
Database: bw1-hs2020-data_step_analysis

### Get iPhone LivingData - Steps

```
select l.pid, l.source, l.unit, l.value, l.startdate AS startDate, l.endtime AS endDate, t.name from dbo.livingdata as l
join dbo.participants as p on p.pid=l.pid
join dbo.type as t on t.id=l.typeid
where p.fulltime = '0' and l.typeid = '1' order by l.pid, l.startdate;
```
Ggf. Source nach "iPhone", "Samsung S9" oder z.B. "Apple Watch" erweitern.

## XML Export
Azure Data Studio -> Export as XML

## bash script

```
chmod a+x xml_create.sh
./xml_create.sh <xml_export_file>
```

## Upload <pid>.xml files
```
git add <pid>.xml
git commit -m "add new xml file/s"
git push 
```
