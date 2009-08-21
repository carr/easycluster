require "rubygems"
require "tokyocabinet"

class Array
  def to_key
    self.join(";")
  end
end

class TokyoCabinetTest
  include TokyoCabinet

  attr_accessor :bdb

  def initialize
    @word_size = 8
    @job_assignment = "bu1"
    @key = [3, 1000, 2000].to_key
    @key2 = [4, 1000, 3000].to_key
  end

  def open
    open_tdb
  end

  def open_tdb
    @bdb = TDB::new

    if !bdb.open("casket.tdb", TDB::OWRITER | TDB::OCREAT)
      ecode = bdb.ecode
      STDERR.printf("open error: %s\n", bdb.errmsg(ecode))
    end
  end

  def open_bdb
    @bdb = BDB::new

    if !bdb.open("casket.tcb", BDB::OWRITER | BDB::OCREAT)
      ecode = bdb.ecode
      STDERR.printf("open error: %s\n", bdb.errmsg(ecode))
    end
  end

  def binary_plus_tree
    bdb.put(@key, @job_assignment)

    bdb.each do |key, value|
      puts "%s : %s" % [key,value]
    end
  end

  def table
    @bdb.put(@key, {"job_assignment" => @job_assignment, "finished" => "1"})
    @bdb.put(@key2, {"job_assignment" => "not ", "finished" => "0"})

    puts @bdb[@key]["job_assignment"]

    qry = TDBQRY::new(@bdb)
    qry.addcond("finished", TDBQRY::QCNUMEQ, "0")
    res = qry.search
    res.each do |rkey|
      rcols = @bdb.get(rkey)
      printf("name:%s\n", rcols["job_assignment"])
    end
  end

  def close
    if !bdb.close
      ecode = bdb.ecode
      STDERR.printf("close error: %s\n", bdb.errmsg(ecode))
    end
  end
end

t = TokyoCabinetTest.new
t.open
t.table
t.close

