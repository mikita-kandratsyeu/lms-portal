'use client';

import { Course } from '@prisma/client';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { ReactTags, Tag } from 'react-tag-autocomplete';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type CustomTagsFormProps = {
  courseId: string;
  initialData: Course;
};

export const CustomTagsForm = ({ courseId, initialData }: CustomTagsFormProps) => {
  const initialCustomTags = initialData.customTags.map((tag) => ({
    label: tag,
    value: tag,
  }));

  const { toast } = useToast();
  const router = useRouter();

  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialCustomTags);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleToggleEdit = () => setIsEditing((prev) => !prev);

  const handleAdd = useCallback(
    (tag: Tag) => {
      setSelectedTags([...selectedTags, { ...tag, label: tag.label }]);
    },
    [selectedTags],
  );

  const handleRemove = useCallback(
    (index: number) => {
      setSelectedTags(selectedTags.filter((_, i) => i !== index));
    },
    [selectedTags],
  );

  const handleRemoveAll = () => {
    setSelectedTags([]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await fetcher.patch(`/api/courses/${courseId}`, {
        body: {
          customTags: selectedTags.map(({ value }) => value),
        },
      });

      toast({ title: 'Course updated' });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValid = (value: string) => {
    const testRegexp = /^[a-zA-Z0-9 !@#$%^&*)(]{2,30}$/i.test(value);

    setIsValid(testRegexp);

    return testRegexp;
  };

  const commonProps = {
    classNames: {
      root: 'react-tags text-primary bg-background border rounded-md',
      rootIsActive: 'is-active',
      rootIsDisabled: 'is-disabled',
      rootIsInvalid: 'is-invalid',
      label: 'react-tags__label',
      tagList: 'react-tags__list',
      tagListItem: 'react-tags__list-item',
      tag: 'react-tags__tag bg-accent',
      tagName: 'react-tags__tag-name',
      comboBox: 'react-tags__combobox',
      listBox: cn(
        'react-tags__listbox bg-popover text-popover-foreground rounded-md border shadow-md',
        !isValid && 'cursor-not-allowed pointer-events-none text-muted-foreground',
      ),
      option: 'react-tags__listbox-option hover:bg-accent',
      optionIsActive: 'is-active bg-accent',
      highlight: 'react-tags__listbox-option-highlight bg-accent',
      input: 'react-tags__combobox-input placeholder:text-muted-foreground',
    },
    labelText: '',
    onAdd: handleAdd,
    onDelete: handleRemove,
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Tags
        <div className="flex items-center gap-x-2">
          {isEditing && (
            <Button onClick={handleRemoveAll} variant="outline" size="sm">
              Remove all
            </Button>
          )}
          <Button onClick={handleToggleEdit} variant="outline" size="sm">
            {isEditing ? (
              <>Cancel</>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="mt-4">
        {!isEditing && (
          <ReactTags
            {...commonProps}
            isDisabled
            placeholderText=""
            selected={selectedTags}
            suggestions={[]}
          />
        )}
        {isEditing && (
          <>
            <ReactTags
              {...commonProps}
              allowNew
              collapseOnSelect
              isDisabled={isSubmitting}
              onValidate={handleValid}
              placeholderText="Enter new tags"
              selected={selectedTags}
              suggestions={[]}
            />
            <div className="flex items-center gap-x-2 mt-4">
              <Button
                disabled={isSubmitting || !selectedTags.length}
                isLoading={isSubmitting}
                onClick={handleSubmit}
              >
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
