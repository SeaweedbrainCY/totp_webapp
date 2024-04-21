#!/bin/bash

FLASK_EXECUTABLE="/usr/local/bin/flask --app app:flask"

run_flask_command() {
    echo "running $FLASK_EXECUTABLE "$@" 2>&1"
    command_output=$($FLASK_EXECUTABLE "$@" 2>&1)
    
    echo "$command_output"
    
    if echo "$command_output" | grep -qiE 'drop|removed' && ! echo "$command_output" | grep -qiE 'MySQLdb.OperationalError'; then
        echo 
        echo "THIS IS A WARNING"
        echo "THE MIGRATION PROCESS MAY HAVE INSTRCUTED THE DROP OF ONE OR MULTIPLE TABLES"
        echo "REVIEW THE VERSION FILE AND DO NOT PUSH UNWANTED CHANGES"
        echo 
        echo "Enter anything to acknowledge"
        echo 
        read _
    fi
}


case $1 in
    "db")
        case $2 in
            "init" | "migrate" | "upgrade" | "downgrade" | "check")
                if [ "$2" == "init" ] || [ "$2" == "check" ]; then
                    run_flask_command "$@"
                else 
                    if [ "$3" == "--my-db-is-backed-up" ]; then
                        run_flask_command "$1 $2"
                    else 
                        echo "/!\ You must backup your database before running a migration"
                        echo "Usage: $0 db [upgrade|downgrade] --my-db-is-backed-up"
                    fi
                fi
                
                ;;
            *)
                echo "Usage: $0 db [init|migrate|upgrade|downgrade|check] "
                ;;
        esac
        ;;
    *)
        echo "Usage: $0 db [init|migrate|upgrade|downgrade|check] "
        ;;
esac

