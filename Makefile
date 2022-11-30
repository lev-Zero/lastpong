NAME	= transcendence
FRONT	= frontend
BACK	= backend
PG		= postgres
PGADMIN	= pgadmin

.PHONY	: all
all	: $(NAME)

front :
	docker-compose stop $(FRONT)
	docker-compose rm $(FRONT)
	docker rmi $(FRONT)
	docker-compose up --force-recreate --build -d

back :
	docker-compose stop $(BACK)
	docker-compose rm $(BACK)
	docker rmi $(BACK)
	docker-compose up --force-recreate --build -d

pg :
	docker-compose stop $(PG)
	docker-compose rm $(PG)
	docker rmi $(PG)
	docker-compose up --force-recreate --build -d

pgadmin :
	docker-compose stop $(PGADMIN)
	docker-compose rm $(PGADMIN)
	docker rmi $(PGADMIN)
	docker-compose up --force-recreate --build -d

.PHONY	: front back pg pgadmin

$(NAME)	:
#ifeq ("$(wildcard .setup)", "")
#	chmod 777 ./install_brew_nestjs.sh
#	sh ./install_brew_nestjs.sh
#	touch .setup
#endif
	docker-compose up --force-recreate --build -d

.PHONY	: clean
clean	:
	docker-compose down -v --rmi all --remove-orphans

.PHONY	: fclean
fclean	: clean
	docker system prune --volumes --all --force
	docker network prune --force
	docker volume prune --force
	rm -f .setup

.PHONY	: re
re	:
	make fclean
	make all


.PHONY	: ps
ps	:
	docker-compose ps
