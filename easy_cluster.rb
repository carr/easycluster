#!/usr/bin/env ruby
require 'boot'
require 'sinatra'

enable :sessions
disable :logging

def connect
  @db = Db::new
  @db.open("localhost", 1978)
end

def init
  @db.vanish

  @db.word = "bub"
  @db.hash = Digest::MD5.hexdigest(@db.word)
  @db.word_size = @db.word.size

  @db.digits_count = 64
  @db.client_processing_time = 0
  @db.processing_time = 0

  @db.total_jobs = @db.digits_count ** @db.word_size
  @db.jobs_left = @db.total_jobs
  @db.client_number = 0
  @db.job_started = false

  @db.eta = 0
  @db.eta_jobs_started = @db.jobs_left
  @db.processing_time_count = 0
end

before do
  connect
end

configure do
  connect
  init
end

# normal routes
get "/" do
  params[:user] ||= Client.generate_random_name
  @include_javascript = true

  @db.result ||= '0'
  @result = @db.result
  @db.close

  erb :index
end

get "/stats" do
  x = erb :stats
  @db.close
  x # stupid
end


get "/restart" do
  init
  @db.close
  erb :restart
end

# ajax routes
post "/emit", :agent => /(.*)/  do
  @target_processing_duration = 1000
  @eta_size = 50

  db = @db
  job_size = 1000

  if params['id']
      id = params['id']
      result = params['result']

      @db.delete(id)
      db.processing_time += Time.now.to_i*1000 - params['time_started'].to_i
      db.client_processing_time += params['processing_time'].to_i

      if result != 'null'
         db.result = result
         db.time_finished = Time.now.to_i

         db.duration = (db.time_finished - db.time_started) * 1000
      else
        if params['processing_speed'] != nil
          # izracunaj ETA
          if db.processing_time_count >= @eta_size
            db.processing_time_count = 0

            db.speed = (db.eta_jobs_started - db.jobs_left).to_f / (Time.now.to_i*1000 - db.eta_started)
            db.eta = db.jobs_left / db.speed

            db.eta_started = Time.now.to_i * 1000
            db.eta_jobs_started = db.jobs_left
          else
            db.processing_time_count += 1
          end

          job_size = (params['processing_speed'].to_f * @target_processing_duration).to_i
        end
      end
  end

  # initialize
  unless db.job_started
    @db.time_started = Time.now.to_i
    db.job_started = true
    db.eta_started = Time.now.to_i * 1000
  end

  if params['user']
    if db.get(params['user'])!="true"
      db.put params['user'], "true"
      db.client_number += 1
    end
  end

  min_range = (db.jobs_left - job_size)
  max_range = (db.jobs_left)
  min_range = 0 if min_range < 0
  decrease_job_size = true

  # returned jobs that timed out to the queue
  @db.jobs_timed_out do |key, record|
    dummy1, dummy2, min_range, max_range = key.split(";")
    decrease_job_size = false
  end

  @json = {
    :phase => db.time_finished.nil? ? 'work' : 'done',
    :jobs_left => db.jobs_left,
    :eta => db.eta,
    :data => {}
  }

  unless min_range == max_range
    job_key = "job;#{db.word_size};#{min_range};#{max_range}"
    time_started = Time.now.to_i*1000
    @json[:id] = job_key
    @json[:hash] = db.hash
    @json[:job_size] = job_size
    @json[:time_started] = time_started

    db.put(job_key, time_started)
  end

  if db.time_finished.nil?
    db.jobs_left -= job_size if decrease_job_size
    db.jobs_left = 0 if db.jobs_left < 0
  else
    @json[:data] = {:result => db.result, :duration => db.duration}
  end

  @json = @json.to_json
  @db.close
  erb :json, :layout => false
end

