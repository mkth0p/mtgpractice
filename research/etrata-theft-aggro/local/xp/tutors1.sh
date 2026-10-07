#!/bin/bash
cd "$(dirname "$0")/../../../.."
source research/etrata-theft-aggro/local/xp/env.sh
export LIST_FILE=research/etrata-theft-aggro/local/lists/skel-A-halver.txt
X() { tools/sim/bench/xp.sh "$@" > /dev/null; }
X skA6 skA7
HEIST_TUTOR="Ramses, Assassin Lord" X skA7 tp-ramsesonly
HEIST_TUTOR="Ramses, Assassin Lord|Interceptor, Shadow's Hound|Roshan, Hidden Magister|Achilles Davenport|Kindred Discovery|Ezio, Blade of Vengeance|Black Widow, Deadly Hunter|Rhystic Study|Leyline of Transformation" X skA7 tp-engines
HEIST_TUTOR="Ramses, Assassin Lord|Swiftfoot Boots|Lightning Greaves|Interceptor, Shadow's Hound|Roshan, Hidden Magister|Achilles Davenport|Kindred Discovery" X skA7 tp-protect
HEIST_TUTOR="Interceptor, Shadow's Hound|Ramses, Assassin Lord|Roshan, Hidden Magister|Achilles Davenport|Bloodletter of Aclazotz|Quietus Spike" X skA7 tp-interceptor
HEIST_TUTOR="Ramses, Assassin Lord|Roaming Throne|Spark Double|Interceptor, Shadow's Hound|Achilles Davenport|Roshan, Hidden Magister|Bloodletter of Aclazotz" X skA7 tp-doublers
X skA7 tp-moretutors '{"cut":["Mothdust Changeling","Hookblade Veteran","Desmond Miles","Basim Ibn Ishaq"],"add":["Grim Tutor","Diabolic Intent","Dimir House Guard","Beseech the Mirror"]}'
echo TUTORS1 DONE
