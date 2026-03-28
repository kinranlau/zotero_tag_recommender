@echo off
del /F "src\modules\examples.ts"
ren "src\modules\examples_new.ts" "examples.ts"
echo File replaced successfully
