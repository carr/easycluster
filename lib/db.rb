require "tokyotyrant"
include TokyoTyrant
class Db < RDB
  TIMEOUT = 5000

  VARIABLES = [:min_range, :max_range, :result, :jobs_left, :time_started, :time_finished,
    :hash, :word_size, :word, :digits_count, :duration, :client_processing_time, :processing_time,
    :job_started, :client_number, :eta, :processing_time_count, :eta_jobs_started, :eta_started, :total_jobs,
    :speed
  ]

  VARIABLES.each do |name|
    class_eval %|
      def #{name}
        var = get("#{name}")
        # konvertaj u integer ako je nesto sto lici na integer
        var = var.to_i if var =~ /^[-]*[0-9]+$/
        var = var.to_f if var =~ /^[-]*[0-9]+\.[0-9]+$/

        var = true if var=='true'
        var = false if var=='false'

        var
      end

      def #{name}=(value)
        value = 'true' if value==true
        value = 'false' if value==false
        put("#{name}", value)
      end
    |
  end

  def communication_percentage # ne valja
    return nil unless job_started
    return nil if processing_time.nil? || processing_time==0

    (processing_time - client_processing_time) *100 / processing_time
  end

  def jobs_in_progress
    each do |key, record|
      if key=~/job;/
        yield(key, record)
      end
    end
  end

  def jobs_timed_out
    jobs_in_progress do |key, record|
      if (Time.now.to_i*1000 - record.to_i) > 5000
        yield(key, record)
      end
    end
  end
end

