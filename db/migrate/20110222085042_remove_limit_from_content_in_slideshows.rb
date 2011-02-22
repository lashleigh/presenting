class RemoveLimitFromContentInSlideshows < ActiveRecord::Migration
  def self.up
    change_column(:slideshows, :content, :text, :limit => nil)

  end

  def self.down
    change_column(:slideshows, :content, :text, :limit => 5.megabytes)
  end
end
