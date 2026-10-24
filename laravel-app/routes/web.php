<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'portfolio.home')->name('portfolio.home');
Route::view('/eden-island', 'portfolio.eden-island')->name('portfolio.eden-island');
Route::view('/eco-ventures', 'portfolio.eco-ventures')->name('portfolio.eco-ventures');
Route::view('/3d-test', 'portfolio.3d-test')->name('portfolio.3d-test');
