class ChangeContentTypeInPreview < ActiveRecord::Migration
  def self.up
    change_column(:previews, :content, :text)
  end

  def self.down
    change_column(:previews, :content, :string)
  end
end
