#!/bin/bash

file="$1"
declare -a allParticipants
allParticipants=($(xml2 < $file | grep pid | cut -d= -f2 | uniq))
#show number of participants
echo ${#allParticipants[*]}

#Fetch xml data for each participant and 
#paste it to a new file with <pid>.xml format

for participant in "${allParticipants[@]}"
do
  #cleanup
  rm $participant.xml
  echo "creating structure for $participant"
  #create file
  touch $participant.xml
  #add xml headers / main element
  echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" > $participant.xml
  echo "<HealthData locale=\"en_CH\">" >> $participant.xml
  #fetch data from main export file and filter out the values for
  #the corresponding <pid>
  xmllint --xpath '/data' data_all_iphones.xml | grep -A 7 -B 1 "<pid>$participant</pid>" >> $participant.xml
  #create backup file, replace row with Record and remove line seperators
  #from previous grep statement
  sed -i.bck -e s/row/Record/g -e s/--//g $participant.xml
  #add xml footer
  echo "</HealthData>" >> $participant.xml  
done

