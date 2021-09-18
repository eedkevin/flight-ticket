
.PHONY: build-up
build-up:
	docker-compose up --build

.PHONY: down
down:
	docker-compose down
