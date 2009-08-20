require 'rubygems'
require 'sinatra.rb'

Sinatra::Application.default_options.merge!(
  :run => false,
  :env => :development
)

require 'easy_cluster.rb'
run Sinatra.application
