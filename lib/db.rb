require "tokyotyrant"
include TokyoTyrant
class Db < RDB
  [:min_range, :max_range, :result, :jobs_left, :time_started, :time_finished,
    :hash, :word_size, :word, :digits_count, :duration, :client_processing_time,
    :job_started, :client_number
  ].each do |name|
    class_eval %|
      def #{name}
        var = get("#{name}")
        # konvertaj u integer ako je nesto sto lici na integer
        var = var.to_i if var =~ /^[-]*[0-9]+$/

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

    (duration - client_processing_time) *100 / duration
  end
end

