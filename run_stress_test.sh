#!/bin/sh

for file in test/stress/scenarios/*.yml ; do
  npx artillery run --config test/stress/config.yml $file
done