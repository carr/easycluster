require "rubygems"
require "drb"
require "andand"
require 'logger'
require 'digest/md5' # treba za client

Dir["lib/*.rb"].each{|x| require x}

